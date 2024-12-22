import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { saveAccessToken } from 'src/services/localStorage.service';

export default function LoginCallback() {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('accessToken');

  useEffect(() => {
    if (accessToken) {
      saveAccessToken(accessToken);
    }
  }, [accessToken]);

  return <Navigate to="/" replace />;
}
