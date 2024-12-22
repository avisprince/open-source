import Peer, { DataConnection } from 'peerjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  commitLocalUpdate,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { graphql } from 'relay-runtime';

import usePublishCanvasData from 'src/components/canvas/hooks/usePublishCanvasData';
import { useActiveUserHeartbeat } from 'src/components/canvas/relay/useActiveUserHeartbeat';
import {
  activeUserMousePositionsAtom,
  sessionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';

import { useSharedCanvas_activeUsers$key } from './__generated__/useSharedCanvas_activeUsers.graphql';

export const peerConnections: {
  peerId: string;
  connections: DataConnection[];
} = {
  peerId: '',
  connections: [],
};

const PEER_CONNECTION =
  import.meta.env.VITE_DEV_MODE === 'true'
    ? {
        key: import.meta.env.VITE_PEER_SERVER_ACCESS_TOKEN,
        host: import.meta.env.VITE_CT_PEERJS_HOST,
        port: 9000,
        path: `/namespaces`,
      }
    : {
        key: import.meta.env.VITE_PEER_SERVER_ACCESS_TOKEN,
        host: import.meta.env.VITE_CT_PEERJS_HOST,
        path: '/peerjs',
      };

export default function useSharedCanvas(
  activeUsersRef: useSharedCanvas_activeUsers$key | null,
) {
  const activeUsers = useFragment(
    graphql`
      fragment useSharedCanvas_activeUsers on ActiveUser @relay(plural: true) {
        peerId
      }
    `,
    activeUsersRef,
  );

  const { namespaceId, sessionId } = useRecoilValue(sessionAtom);
  const [peer, setPeer] = useState<Peer | null>(null);
  const finishedConnectingRef = useRef(false);
  const publishData = usePublishCanvasData();
  const [triggerActiveHeartbeat] = useActiveUserHeartbeat();

  const setActiveUserPositions = useSetRecoilState(
    activeUserMousePositionsAtom,
  );

  const removeConnection = useCallback((conn: DataConnection) => {
    peerConnections.connections = peerConnections.connections.filter(
      c => c.connectionId !== conn.connectionId,
    );
  }, []);

  const removeMousePointer = useCallback(
    (id: string) => {
      setActiveUserPositions(curr => {
        const copy = { ...curr };
        delete copy[id];
        return copy;
      });
    },
    [setActiveUserPositions],
  );

  const handleBlur = useCallback(() => {
    publishData({
      type: 'mouseOffCanvas',
    });
  }, [publishData]);

  const environment = useRelayEnvironment();
  const handleIncomingData = useCallback(
    (data: any) => {
      switch (data.type) {
        case 'mouse': {
          setActiveUserPositions(curr => {
            return {
              ...curr,
              [data.id]: {
                x: data.x,
                y: data.y,
              },
            };
          });
          break;
        }
        case 'mouseOffCanvas': {
          removeMousePointer(data.id);
          break;
        }
        case 'item': {
          commitLocalUpdate(environment, store => {
            const namespace = store.get(namespaceId);
            const items = namespace?.getLinkedRecords('items') || [];
            const services = namespace?.getLinkedRecords('services') || [];
            const databases = namespace?.getLinkedRecords('databases') || [];

            [...items, ...services, ...databases].forEach(item => {
              const cachedItemId = item.getValue('itemId');
              if (data.itemId === cachedItemId) {
                const itemCanvasInfo = item.getLinkedRecord('canvasInfo');
                itemCanvasInfo?.setValue(data.x, 'posX');
                itemCanvasInfo?.setValue(data.y, 'posY');
              }
            });
          });
          break;
        }
      }
    },
    [setActiveUserPositions, removeMousePointer, environment, namespaceId],
  );

  useEffect(() => {
    let peer: Peer;

    try {
      peer = new Peer(sessionId, PEER_CONNECTION);
      peerConnections.peerId = peer.id;
      setPeer(peer);

      peer.on('connection', (connection: DataConnection) => {
        peerConnections.connections = peerConnections.connections
          .filter(c => c.connectionId !== connection.connectionId)
          .concat(connection);
        connection.on('data', handleIncomingData);
      });
    } catch (err) {
      console.log(err);
    }

    const interval = setInterval(() => {
      triggerActiveHeartbeat(peer.id);
    }, 30000);

    window.addEventListener('blur', handleBlur);
    document.addEventListener('mouseleave', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('mouseleave', handleBlur);
      peer.destroy();
      clearInterval(interval);
    };
  }, [
    handleBlur,
    handleIncomingData,
    triggerActiveHeartbeat,
    sessionId,
    namespaceId,
  ]);

  useEffect(() => {
    if (!!peer && !finishedConnectingRef.current) {
      (activeUsers ?? [])
        .filter(user => user.peerId !== peer.id)
        .forEach(user => {
          const conn = peer.connect(user.peerId);
          conn.on('open', () => {
            peerConnections.connections = [
              ...peerConnections.connections,
              conn,
            ];
          });
          conn.on('data', handleIncomingData);
          conn.on('error', () => removeConnection(conn));
          conn.on('close', () => removeConnection(conn));
        });

      finishedConnectingRef.current = true;
    }
  }, [peer, activeUsers, handleIncomingData, removeConnection]);
}
