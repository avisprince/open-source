import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AuthGuard from 'src/components/AuthGuard';
import Dashboard from 'src/components/dashboard/Dashboard';
import Loading from 'src/components/general/Loading';
import CanvasProvider from 'src/providers/CanvasProvider';
import DokkimiProvider from 'src/providers/DokkimiProvider';

export default function Dokkimi() {
  return (
    <AuthGuard>
      <Suspense fallback={<Loading />}>
        <DokkimiProvider>
          <Routes>
            <Route path="dashboard">
              <Route path=":orgId/:tab" element={<Dashboard />} />
              <Route path=":orgId" element={<Dashboard />} />
              <Route index path="" element={<Dashboard />} />
            </Route>
            <Route path="sandboxes">
              <Route path=":namespaceId" element={<CanvasProvider />} />
              <Route
                index
                path=""
                element={<Navigate to="/dashboard" replace />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DokkimiProvider>
      </Suspense>
    </AuthGuard>
  );
}
