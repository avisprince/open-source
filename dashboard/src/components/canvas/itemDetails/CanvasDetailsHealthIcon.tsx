import { Spinner } from '@fluentui/react-components';
import { Checkmark24Regular, Dismiss24Regular } from '@fluentui/react-icons';

import { DokkimiColors } from 'src/components/styles/colors';

type Props = {
  namespaceStatus: string | null | undefined;
};

export default function CanvasDetailsHealthIcon({ namespaceStatus }: Props) {
  if (namespaceStatus === 'loading') {
    return <Spinner size="tiny" />;
  }

  if (namespaceStatus === 'running') {
    return (
      <Checkmark24Regular primaryFill={DokkimiColors.accentBackgroundColor} />
    );
  }

  if (namespaceStatus === 'crashed') {
    return (
      <Dismiss24Regular primaryFill={DokkimiColors.accentBackgroundColor} />
    );
  }

  return null;
}
