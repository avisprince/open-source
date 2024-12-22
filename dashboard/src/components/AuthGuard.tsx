import { getAccessToken } from 'src/services/localStorage.service';

type Props = {
  children: JSX.Element;
};

export default function AuthGuard({ children }: Props): JSX.Element {
  const accessToken = getAccessToken();

  if (!accessToken) {
    window.location.href = `${import.meta.env.VITE_CLIENT_DOMAIN}/login`;
    return <div />;
  }

  return children;
}
