import { useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { graphql } from 'relay-runtime';
import { v4 as uuid } from 'uuid';

import Canvas from 'src/components/canvas/Canvas';
import Loading from 'src/components/general/Loading';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { CanvasProviderQuery } from './__generated__/CanvasProviderQuery.graphql';

export default function CanvasProvider() {
  const [session, setSession] = useRecoilState(sessionAtom);
  const { namespaceId } = useParams();
  const navigate = useNavigate();

  const { currentUser, userNamespaces } = useLazyLoadQuery<CanvasProviderQuery>(
    graphql`
      query CanvasProviderQuery {
        currentUser {
          id
        }
        userNamespaces {
          id
          permissions {
            organizationId
          }
        }
      }
    `,
    {},
  );

  useEffect(() => {
    const namespace = userNamespaces.find(ns => ns.id === namespaceId);
    if (!namespaceId || !namespace) {
      navigate(`/dashboard`, { replace: true });
      return;
    }

    setSession(prev => ({
      ...prev,
      namespaceId,
      orgId: namespace.permissions.organizationId,
      sessionId: `${namespaceId}-${currentUser.id}-${uuid().split('-')[0]}`,
    }));
  }, [namespaceId, currentUser, userNamespaces, setSession, navigate]);

  if (!session.namespaceId) {
    return <Loading />;
  }

  return <Canvas />;
}
