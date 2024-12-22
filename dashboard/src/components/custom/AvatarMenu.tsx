import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
} from '@fluentui/react-components';
import { graphql, useFragment } from 'react-relay';

import DokkimiAvatar from 'src/components/custom/DokkimiAvatar';
import Icon from 'src/components/custom/Icon';
import { Stylesheet } from 'src/types/Stylesheet';
import logout from 'src/util/logout';

import { AvatarMenu_user$key } from './__generated__/AvatarMenu_user.graphql';

type Props = {
  userRef: AvatarMenu_user$key;
};

export default function AvatarMenu({ userRef }: Props) {
  const currentUser = useFragment(
    graphql`
      fragment AvatarMenu_user on User {
        name
        picture
      }
    `,
    userRef,
  );

  return (
    <Menu>
      <MenuTrigger>
        <div style={styles.avatarContainer}>
          <Text>{currentUser.name}</Text>
          <DokkimiAvatar src={currentUser.picture} />
          <Icon name="chevronDown" />
        </div>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem icon={<Icon name="signout" />} onClick={logout}>
            Log Out
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

const styles = {
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
    gap: 8,
    height: 50,
    minWidth: 120,
    maxWidth: 240,
    cursor: 'pointer',
  },
} satisfies Stylesheet;
