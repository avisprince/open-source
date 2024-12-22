import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import AvatarMenu from 'src/components/custom/AvatarMenu';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import Logo from 'src/images/alex-with-text.svg';
import { Stylesheet } from 'src/types/Stylesheet';

import { Header_user$key } from './__generated__/Header_user.graphql';

type Props = {
  userRef: Header_user$key;
};

export default function Header({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment Header_user on User {
        ...AvatarMenu_user
      }
    `,
    userRef,
  );

  return (
    <Flexbox
      alignItems="center"
      justifyContent="space-between"
      style={styles.container}
    >
      <img src={Logo} />
      <AvatarMenu userRef={user} />
    </Flexbox>
  );
}

const styles = {
  container: {
    flexShrink: 0,
    height: 80,
    width: '100%',
    padding: '0 32px',
    backgroundColor: DokkimiColorsV2.blackPrimary,
  },
} satisfies Stylesheet;
