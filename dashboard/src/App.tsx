import { Route, Routes } from 'react-router-dom';

import Dokkimi from 'src/components/Dokkimi';
import Login from 'src/components/login/Login';
import LoginCallback from 'src/components/login/LoginCallback';

export default function App() {
  return (
    <Routes>
      <Route path="login/callback" element={<LoginCallback />} />
      <Route path="login" element={<Login />} />
      <Route path="/*" element={<Dokkimi />} />
    </Routes>
  );
}
