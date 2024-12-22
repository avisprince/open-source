import { Avatar, Tooltip } from '@fluentui/react-components';
import { HTMLAttributes, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import DokkimiAvatar from 'src/components/custom/DokkimiAvatar';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import { Stylesheet } from 'src/types/Stylesheet';

import { CanvasActiveUsers_activeUsers$key } from './__generated__/CanvasActiveUsers_activeUsers.graphql';

type Props = HTMLAttributes<HTMLDivElement> & {
  activeUserRefs: CanvasActiveUsers_activeUsers$key;
};

export default function CanvasActiveUsers({ activeUserRefs }: Props) {
  const activeUsers = useFragment(
    graphql`
      fragment CanvasActiveUsers_activeUsers on ActiveUser
      @relay(plural: true) {
        color
        user {
          name
          picture
        }
      }
    `,
    activeUserRefs,
  );

  const [visibleUsers, moreUsers] = useMemo(() => {
    const users = activeUsers;
    return [users.slice(0, 3), users.slice(3)];
  }, [activeUsers]);

  if (!visibleUsers.length) {
    return null;
  }

  return (
    <Flexbox
      alignItems="center"
      justifyContent="end"
      style={styles.activeUsersContainer}
    >
      <Flexbox
        alignItems="center"
        justifyContent="end"
        gap={8}
        style={styles.activeUsers}
      >
        {visibleUsers.map(({ user, color }, index) => (
          <Tooltip
            key={index}
            content={user.name}
            positioning="below"
            relationship="label"
          >
            <div
              style={stylist([styles.avatarImage, { backgroundColor: color }])}
            >
              <DokkimiAvatar src={user.picture} />
            </div>
          </Tooltip>
        ))}
        {moreUsers.length > 0 && <div>+{moreUsers.length} more...</div>}
      </Flexbox>
    </Flexbox>
  );
}

const styles = {
  activeUsersContainer: {
    marginTop: 4,
  },
  activeUsers: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: DokkimiColors.blackBackgroundColor,
  },
  avatarImage: {
    borderRadius: '50%',
    padding: 2,
  },
} satisfies Stylesheet;
