import { HTMLAttributes, useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { useSetRecoilState } from 'recoil';
import { graphql } from 'relay-runtime';

import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import { DokkimiProviderQuery } from 'src/providers/__generated__/DokkimiProviderQuery.graphql';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = HTMLAttributes<HTMLDivElement>;

export default function DokkimiProvider({ children }: Props) {
  const setSession = useSetRecoilState(sessionAtom);

  const queryData = useLazyLoadQuery<DokkimiProviderQuery>(
    graphql`
      query DokkimiProviderQuery {
        currentUser {
          email
          organizations {
            id
          }
        }
      }
    `,
    {},
  );

  useEffect(() => {
    const {
      organizations: [{ id: orgId }],
    } = queryData.currentUser;

    setSession(prev => ({
      ...prev,
      orgId,
    }));
  }, [queryData, setSession]);

  (window as any).Jellysync.setUser(queryData.currentUser.email);

  return (
    <Flexbox direction="column" style={styles.container}>
      <div style={styles.children}>{children}</div>
    </Flexbox>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  children: {
    position: 'relative',
    height: '100%',
    width: '100%',
    flexGrow: 1,
    backgroundColor: DokkimiColors.tertiaryBackgroundColor,
    overflow: 'hidden',
  },
} satisfies Stylesheet;
