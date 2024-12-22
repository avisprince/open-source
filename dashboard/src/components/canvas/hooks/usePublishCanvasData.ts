import { useCallback } from 'react';

import { peerConnections } from 'src/components/canvas/hooks/useSharedCanvas';

export default function usePublishCanvasData() {
  return useCallback(
    (data: any) => {
      const peerId = peerConnections.peerId;
      if (peerId) {
        peerConnections.connections?.forEach(conn => {
          if (conn.connectionId !== peerId) {
            conn.send({
              ...data,
              id: peerId,
            });
          }
        });
      }
    },
    [],
  );
}
