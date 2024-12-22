import { Divider, Menu, MenuItem, MenuList } from '@fluentui/react-components';
import { graphql, useFragment } from 'react-relay';
import { useSetRecoilState } from 'recoil';

import { useDeleteNamespaceItem } from 'src/components/canvas/relay/useDeleteNamespaceItem';
import useSaveItemAsTemplate from 'src/components/canvas/relay/useSaveItemAsTemplate';
import useStartNamespaceItem from 'src/components/canvas/relay/useStartNamespaceItem';
import useStopNamespaceItem from 'src/components/canvas/relay/useStopNamespaceItem';
import Icon from 'src/components/custom/Icon';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import { hoveringContextMenuAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { CanvasItemContextMenu_namespaceItem$key } from './__generated__/CanvasItemContextMenu_namespaceItem.graphql';

type Props = {
  namespaceItemRef: CanvasItemContextMenu_namespaceItem$key;
  pos: { x: number; y: number };
  namespaceStatus: string | null | undefined;
  onClose: () => void;
  onDuplicate: (itemId: string) => void;
};

export default function CanvasItemContextMenu({
  namespaceItemRef,
  pos,
  namespaceStatus,
  onClose,
  onDuplicate,
}: Props) {
  const item = useFragment(
    graphql`
      fragment CanvasItemContextMenu_namespaceItem on NamespaceItem {
        itemId
        itemType
        namespaceStatus
      }
    `,
    namespaceItemRef,
  );

  const [deleteItem] = useDeleteNamespaceItem(item.itemId);
  const [saveItemAsTemplate] = useSaveItemAsTemplate(item.itemId);
  const [startNamespaceItem] = useStartNamespaceItem(item.itemId);
  const [stopNamespaceItem] = useStopNamespaceItem(item.itemId);
  const setHoveringContextMenu = useSetRecoilState(hoveringContextMenuAtom);

  const closeMenu = () => {
    setHoveringContextMenu(false);
    onClose();
  };

  const showNamespaceActions =
    namespaceStatus === 'active' &&
    ['Service', 'Database'].includes(item.itemType);

  const showSaveAsTemplate = [
    'Service',
    'Database',
    'HttpRequest',
    'DbQuery',
    'MockEndpoint',
  ].includes(item.itemType);

  return (
    <div
      onMouseEnter={() => setHoveringContextMenu(true)}
      onMouseLeave={() => setHoveringContextMenu(false)}
      style={stylist([
        styles.container,
        {
          top: pos.y,
          left: pos.x,
        },
      ])}
    >
      <Menu open={true}>
        <MenuList>
          {showNamespaceActions && (
            <>
              {item.namespaceStatus == null && (
                <MenuItem
                  icon={<Icon name="play" />}
                  onClick={() => {
                    startNamespaceItem();
                    closeMenu();
                  }}
                >
                  Start
                </MenuItem>
              )}
              {item.namespaceStatus != null && (
                <MenuItem
                  icon={<Icon name="stop" />}
                  onClick={() => {
                    stopNamespaceItem();
                    closeMenu();
                  }}
                >
                  Stop
                </MenuItem>
              )}
              <Divider />
            </>
          )}
          {showSaveAsTemplate && (
            <MenuItem
              icon={<Icon name="save" />}
              onClick={() => {
                closeMenu();
                saveItemAsTemplate();
              }}
            >
              Save as Template
            </MenuItem>
          )}
          <MenuItem
            icon={<Icon name="copy" />}
            onClick={() => {
              onDuplicate(item.itemId);
              closeMenu();
            }}
          >
            Duplicate
          </MenuItem>
          <MenuItem
            icon={<Icon name="delete" />}
            onClick={() => {
              deleteItem();
              closeMenu();
            }}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    padding: 4,
    backgroundColor: DokkimiColors.blackBackgroundColor,
    border: `1px solid rgba(117, 117, 117, 0.4)`,
    borderRadius: 4,
    zIndex: 1000,
  },
} satisfies Stylesheet;
