import { Button } from '@fluentui/react-components';

import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import dokkimiLogo from 'src/images/alex-no-bg.svg';
import dokkimiText from 'src/images/dokkimi-welcome-text.svg';
import { Stylesheet } from 'src/types/Stylesheet';

export default function Login() {
  return (
    <Flexbox
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap={40}
      style={styles.container}
    >
      <img src={dokkimiLogo} alt="dokkimiLogo" style={styles.logo} />
      <img src={dokkimiText} alt="dokkimiTitle" style={styles.welcomeText} />
      <div style={styles.subTitle}>
        Where you create instant test sandboxes for your microservice
        architecture
      </div>
      <Button
        appearance="primary"
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_CT_DOMAIN}/auth/login?redirectUri=${import.meta.env.VITE_CLIENT_DOMAIN}/login/callback`;
        }}
        style={styles.loginButton}
      >
        Login
      </Button>
    </Flexbox>
  );
}

const styles: Stylesheet = {
  container: {
    height: '100vh',
    width: '100wh',
  },
  loginButton: {
    height: 32,
    width: 180,
    color: 'black',
  },
  logo: {
    height: 120,
    width: 120,
  },
  subTitle: {
    color: DokkimiColors.secondaryText,
  },
  welcomeText: {
    height: 48,
    width: 624,
  },
};
