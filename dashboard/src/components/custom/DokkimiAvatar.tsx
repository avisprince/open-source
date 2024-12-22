import { Avatar, AvatarSize } from '@fluentui/react-components';

type Props = {
  src: string | null | undefined;
  size?: AvatarSize;
};

export default function DokkimiAvatar({ src, size }: Props) {
  return src ? <Avatar image={{ src }} size={size} /> : <Avatar size={size} />;
}
