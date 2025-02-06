import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useSetRecoilState } from 'recoil';

import { CanvasItemType } from 'src/components/canvas/Canvas';
import useAddItemToNamespace from 'src/components/canvas/relay/useAddItemToNamespace';
import useAddTemplateToNamespace from 'src/components/canvas/relay/useAddTemplateToNamespace';
import { canvasTools } from 'src/components/canvas/sidebar/tools/CanvasTools';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import { hoveringContextMenuAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import {
  CanvasContextMenu_namespaceItemTemplates$data,
  CanvasContextMenu_namespaceItemTemplates$key,
} from './__generated__/CanvasContextMenu_namespaceItemTemplates.graphql';

type Props = {
  templatesRef: CanvasContextMenu_namespaceItemTemplates$key;
  pos: { x: number; y: number; canvasX: number; canvasY: number };
  onClose: () => void;
};

export default function CanvasContextMenu({
  templatesRef,
  pos,
  onClose,
}: Props) {
  const templates = useFragment(
    graphql`
      fragment CanvasContextMenu_namespaceItemTemplates on NamespaceItemTemplate
      @relay(plural: true) {
        id
        template {
          itemType
          displayName
        }
        updatedAt
      }
    `,
    templatesRef,
  );

  const setHoveringContextMenu = useSetRecoilState(hoveringContextMenuAtom);
  const [addItemToNamespace] = useAddItemToNamespace();
  const [addTemplateToNamespace] = useAddTemplateToNamespace();

  const onAddItem = useCallback(
    (itemType: CanvasItemType) => {
      addItemToNamespace(itemType, pos.canvasX, pos.canvasY);
      onClose();
    },
    [pos.canvasX, pos.canvasY, addItemToNamespace, onClose],
  );

  const onSelectTemplate = useCallback(
    (template: CanvasContextMenu_namespaceItemTemplates$data[number]) => {
      if (!template.id) {
        return;
      }

      addTemplateToNamespace(template.id, {
        posX: pos.canvasX,
        posY: pos.canvasY,
      });

      onClose();
    },
    [pos.canvasX, pos.canvasY, addTemplateToNamespace, onClose],
  );

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
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <MenuItem>Add Tool</MenuItem>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {canvasTools.map(({ canvasItemType, icon }, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => onAddItem(canvasItemType)}
                  >
                    <Flexbox alignItems="center" gap={12}>
                      <Flexbox
                        alignItems="center"
                        justifyContent="center"
                        style={{ width: 20 }}
                      >
                        <FontAwesomeIcon icon={icon} size="lg" />
                      </Flexbox>
                      <div>{canvasItemType}</div>
                    </Flexbox>
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <MenuItem>Add Template</MenuItem>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {[...templates]
                  .sort((a, b) => {
                    return dayjs(a.updatedAt).isBefore(b.updatedAt) ? 1 : -1;
                  })
                  .map(nsTemplate => {
                    const canvasTool = canvasTools.find(tool => {
                      return (
                        tool.canvasItemType === nsTemplate.template.itemType
                      );
                    });

                    if (!canvasTool) {
                      return null;
                    }

                    return (
                      <MenuItem
                        key={nsTemplate.id}
                        onClick={() => onSelectTemplate(nsTemplate)}
                      >
                        <Flexbox alignItems="center" gap={12}>
                          <Flexbox
                            alignItems="center"
                            justifyContent="center"
                            style={{ width: 20 }}
                          >
                            <FontAwesomeIcon icon={canvasTool.icon} size="lg" />
                          </Flexbox>
                          <div>{nsTemplate.template.displayName}</div>
                        </Flexbox>
                      </MenuItem>
                    );
                  })}
              </MenuList>
            </MenuPopover>
          </Menu>
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
