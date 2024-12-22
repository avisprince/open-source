import { clearAccessToken } from 'src/services/localStorage.service';

export default function logout() {
  clearAccessToken();
  window.location.href = `https://dokkimi.us.auth0.com/v2/logout?client_id=${
    import.meta.env.VITE_AUTH0_CLIENT_ID
  }&returnTo=${import.meta.env.VITE_CLIENT_DOMAIN}/login`;
}
