import {
  Button,
  Divider,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import { useState } from 'react';
import { useFragment } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { graphql } from 'relay-runtime';

import useCreateNamespace from 'src/components/canvas/relay/useCreateNamespace';
import { useDeleteNamespace } from 'src/components/canvas/relay/useDeleteNamespace';
import { useDuplicateNamespace } from 'src/components/canvas/relay/useDuplicateNamespace';
import { useUpdateNamespace } from 'src/components/canvas/relay/useUpdateNamespace';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { SelectNamespaceMenu_namespace$key } from './__generated__/SelectNamespaceMenu_namespace.graphql';
import { SelectNamespaceMenu_query$key } from './__generated__/SelectNamespaceMenu_query.graphql';

type Props = {
  queryRef: SelectNamespaceMenu_query$key;
};

export default function SelectNamespaceMenu({ queryRef }: Props) {
  const setSession = useSetRecoilState(sessionAtom);
  const [renameMode, setRenameMode] = useState<boolean>(false);
  const data = useFragment(
    graphql`
      fragment SelectNamespaceMenu_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        namespaceId: { type: "ID!" }
      ) {
        namespaces(organizationId: $organizationId, type: "sandbox") {
          id
          name
        }
        namespace(namespaceId: $namespaceId) {
          ...SelectNamespaceMenu_namespace
        }
      }
    `,
    queryRef,
  );

  const namespace = useFragment<SelectNamespaceMenu_namespace$key>(
    graphql`
      fragment SelectNamespaceMenu_namespace on Namespace {
        id
        name
      }
    `,
    data.namespace,
  );

  const [namespaceName, setNamespaceName] = useState<string>(namespace.name);

  const navigate = useNavigate();
  const [updateNamespace] = useUpdateNamespace();
  const [deleteNamespace] = useDeleteNamespace();
  const [createNamespace] = useCreateNamespace();
  const [duplicateNamespace] = useDuplicateNamespace();

  const navigateToNamespace = (namespaceId: string) => {
    setSession(prev => ({
      ...prev,
      namespaceId,
    }));
    navigate(`/sandboxes/${namespaceId}`);
  };

  const onDuplicate = (namespaceId: string) => {
    duplicateNamespace(namespaceId, navigateToNamespace);
  };

  const onDelete = (namespaceId: string) => {
    deleteNamespace(namespaceId, () => {
      if (namespaceId === namespace.id) {
        navigate('/dashboard', { replace: true });
      }
    });
  };

  const onUpdateName = () => {
    updateNamespace({ name: namespaceName });
  };

  const onNewEnv = () => {
    createNamespace('New Sandbox', navigateToNamespace);
  };

  if (renameMode) {
    return (
      <Flexbox alignItems="center" style={styles.container} gap={16}>
        <Input
          style={styles.renameInput}
          defaultValue={namespace.name}
          value={namespaceName}
          onChange={e => setNamespaceName(e.target.value)}
        />
        <Flexbox alignItems="center" gap={4}>
          <Button
            appearance="subtle"
            icon={<Icon name="checkmark" />}
            onClick={() => {
              onUpdateName();
              setRenameMode(false);
            }}
          />
          <Button
            appearance="subtle"
            icon={<Icon name="close" />}
            onClick={() => {
              setRenameMode(false);
              setNamespaceName(namespace.name);
            }}
          />
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox alignItems="center" style={styles.container} gap={16}>
      <Menu>
        <MenuTrigger>
          <div style={styles.namespacesSelectWrapper}>
            <Flexbox
              alignItems="center"
              justifyContent="space-between"
              style={styles.namespacesSelectContainer}
            >
              <Text style={styles.namespaceName}>{namespaceName}</Text>
              <Icon name="chevronUpDown" />
            </Flexbox>
          </div>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {data.namespaces.map(ns => (
              <Menu key={ns.id}>
                <MenuTrigger disableButtonEnhancement>
                  <MenuItem
                    style={stylist([
                      {
                        backgroundColor:
                          ns.id === namespace.id
                            ? DokkimiColors.accentBackgroundColor
                            : undefined,
                      },
                    ])}
                    onClick={() => {
                      if (ns.id !== namespace.id) {
                        navigateToNamespace(ns.id);
                      }
                    }}
                  >
                    <Tooltip
                      content={ns.name}
                      positioning="before"
                      relationship="label"
                    >
                      <div style={styles.namespaceNameMenuItem}>
                        <Text style={styles.namespaceName}>{ns.name}</Text>
                      </div>
                    </Tooltip>
                  </MenuItem>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      icon={<Icon name="copy" />}
                      onClick={() => onDuplicate(ns.id)}
                    >
                      Copy
                    </MenuItem>
                    <MenuItem
                      icon={<Icon name="delete" />}
                      onClick={() => onDelete(ns.id)}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
      <Menu>
        <MenuTrigger>
          <div style={styles.moreButtonContainer}>
            <Button
              appearance="subtle"
              icon={<Icon name="threeDotsVertical" />}
            />
          </div>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem
              icon={<Icon name="edit" />}
              onClick={() => setRenameMode(true)}
            >
              Rename
            </MenuItem>
            <MenuItem
              icon={<Icon name="delete" />}
              onClick={() => onDelete(namespace.id)}
            >
              Delete
            </MenuItem>
            <Divider />
            <MenuItem icon={<Icon name="plus" />} onClick={onNewEnv}>
              New Sandbox
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Flexbox>
  );
}

const styles = {
  container: {
    height: '100%',
  },
  moreButtonContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  namespaceName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textAlign: 'start',
  },
  namespaceNameMenuItem: {
    width: 240,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  namespacesSelectContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: '100%',
    width: 240,
    paddingLeft: 16,
    cursor: 'pointer',
  },
  namespacesSelectWrapper: {
    width: 240,
    height: '100%',
  },
  renameInput: {
    width: 200,
    marginLeft: 8,
  },
} satisfies Stylesheet;
