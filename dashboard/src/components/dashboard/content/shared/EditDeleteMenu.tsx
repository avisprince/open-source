import {
  Button,
  ButtonProps,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { ReactNode } from 'react';

import Icon from 'src/components/custom/Icon';

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  startContent?: ReactNode;
  endContent?: ReactNode;
} & ButtonProps;

export default function EditDeleteMenu({
  onEdit,
  onDelete,
  startContent,
  endContent,
  ...props
}: Props) {
  return (
    <Menu hasCheckmarks={false} positioning="below-end">
      <MenuTrigger>
        <Button
          appearance="subtle"
          icon={<Icon name="threeDotsHorizontal" />}
          {...props}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {startContent}
          <MenuItem icon={<Icon name="edit" />} onClick={onEdit}>
            Edit
          </MenuItem>
          <MenuItem icon={<Icon name="delete" />} onClick={onDelete}>
            Delete
          </MenuItem>
          {endContent}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
