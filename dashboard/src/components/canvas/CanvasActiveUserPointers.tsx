import { graphql, useFragment } from 'react-relay';
import { useRecoilValue } from 'recoil';

import CanvasPointer from 'src/components/canvas/CanvasPointer';
import useSharedCanvas from 'src/components/canvas/hooks/useSharedCanvas';
import { activeUserMousePositionsAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { CanvasActiveUserPointers_activeUsers$key } from './__generated__/CanvasActiveUserPointers_activeUsers.graphql';

type Props = {
  activeUsersRef: CanvasActiveUserPointers_activeUsers$key;
};

export default function CanvasActiveUserPointers({ activeUsersRef }: Props) {
  const activeUserMousePositions = useRecoilValue(activeUserMousePositionsAtom);

  const activeUsers = useFragment(
    graphql`
      fragment CanvasActiveUserPointers_activeUsers on ActiveUser
      @relay(plural: true) {
        peerId
        color
        user {
          name
        }
        ...useSharedCanvas_activeUsers
      }
    `,
    activeUsersRef,
  );

  useSharedCanvas(activeUsers);

  return (
    <>
      {Object.entries(activeUserMousePositions).map(([id, { x, y }], index) => {
        const user = activeUsers.find(u => u.peerId === id);

        if (!user) {
          return null;
        }

        return (
          <CanvasPointer
            displayName={user.user.name}
            color={user.color}
            x={x}
            y={y}
            key={index}
          />
        );
      })}
    </>
  );
}
