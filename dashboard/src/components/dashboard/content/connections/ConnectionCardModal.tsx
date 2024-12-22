import { Button, Dropdown, Input, Option } from '@fluentui/react-components';
import { faAws, faDocker } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import { Stylesheet } from 'src/types/Stylesheet';

import { ConnectionCardModal_secret$key } from './__generated__/ConnectionCardModal_secret.graphql';
import { DockerRegistrySecretInput } from './hooks/__generated__/useCreateSecretMutation.graphql';

const defaultNewConnectionState: DockerRegistrySecretInput = {
  repository: '',
  name: '',
  username: '',
  accessToken: '',
  ecrClientId: '',
  ecrClientRegion: '',
};

type Props = {
  show: boolean;
  secretRef: ConnectionCardModal_secret$key | null;
  onClose: () => void;
  onConfirm: (secret: DockerRegistrySecretInput) => void;
};

export default function ConnectionCardModal({
  show,
  secretRef,
  onClose,
  onConfirm,
}: Props) {
  const secret = useFragment(
    graphql`
      fragment ConnectionCardModal_secret on DockerRegistrySecret {
        name
        repository
        username
        accessToken
        ecrClientId
        ecrClientRegion
      }
    `,
    secretRef,
  );

  const [newConnectionState, setNewConnectionState] = useState(
    secret ?? defaultNewConnectionState,
  );

  const onClickClose = () => {
    setNewConnectionState(secret ?? defaultNewConnectionState);
    onClose();
  };

  const onClickConfirm = () => {
    onConfirm(newConnectionState);
    onClose();
  };

  return (
    <DokkimiModal
      isOpen={show}
      showCloseButton
      width={600}
      toggle={onClickClose}
    >
      <Flexbox
        gap={16}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={styles.modalContent}
      >
        {secret ? <div>Edit Connection</div> : <div>Create New Connection</div>}
        <Dropdown
          placeholder="Select a connection"
          onOptionSelect={(_, data) =>
            setNewConnectionState(prev => ({
              ...prev,
              repository: data.optionValue ?? '',
            }))
          }
          value={newConnectionState.repository}
        >
          <Option text="Docker">
            <Flexbox alignItems="center" gap={8}>
              <FontAwesomeIcon icon={faDocker} color="#2396EE" fontSize={20} />
              <div>Docker</div>
            </Flexbox>
          </Option>
          <Option text="ECR">
            <Flexbox alignItems="center" gap={8}>
              <FontAwesomeIcon icon={faAws} color="#FF9900" fontSize={20} />
              <div>ECR</div>
            </Flexbox>
          </Option>
        </Dropdown>
        <Flexbox alignItems="center" gap={8}>
          {newConnectionState.repository && (
            <Input
              placeholder="Nickname"
              value={newConnectionState.name ?? ''}
              onChange={e =>
                setNewConnectionState(prev => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              style={styles.secretsInput}
            />
          )}
          {newConnectionState.repository === 'Docker' && (
            <>
              <Input
                placeholder="Username"
                value={newConnectionState.username ?? ''}
                onChange={e =>
                  setNewConnectionState(prev => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                style={styles.secretsInput}
              />
              <Input
                placeholder="Access Token"
                value={newConnectionState.accessToken ?? ''}
                onChange={e =>
                  setNewConnectionState(prev => ({
                    ...prev,
                    accessToken: e.target.value,
                  }))
                }
                style={styles.secretsInput}
                type="password"
              />
            </>
          )}
          {newConnectionState.repository === 'ECR' && (
            <>
              <Input
                placeholder="Acount ID"
                value={newConnectionState.ecrClientId ?? ''}
                onChange={e =>
                  setNewConnectionState(prev => ({
                    ...prev,
                    ecrClientRegion: e.target.value,
                  }))
                }
                style={styles.secretsInput}
              />
              <Input
                placeholder="Region"
                value={newConnectionState.ecrClientRegion ?? ''}
                onChange={e =>
                  setNewConnectionState(prev => ({
                    ...prev,
                    ecrClientRegion: e.target.value,
                  }))
                }
                style={styles.secretsInput}
              />
            </>
          )}
        </Flexbox>
        <Button
          appearance="primary"
          onClick={onClickConfirm}
          disabled={!newConnectionState.name}
        >
          {secret ? 'Save' : 'Create'}
        </Button>
      </Flexbox>
    </DokkimiModal>
  );
}

const styles = {
  modalContent: {
    padding: '64px 0 120px',
  },
  secretsInput: {
    width: 140,
  },
} satisfies Stylesheet;
