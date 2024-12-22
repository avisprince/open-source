import { Button } from '@fluentui/react-components';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import RcUpload from 'rc-upload';
import tailwind from 'tailwind';

import Flexbox from 'src/components/custom/Flexbox';

type Props = {
  children?: React.ReactNode;
  onFileReady: (file: File) => void;
  setProgress: (progress: number | null) => void;
};

export default function Upload({ children, setProgress, onFileReady }: Props) {
  return (
    <RcUpload
      beforeUpload={(file: File) => {
        onFileReady(file);
        return false;
      }}
      onProgress={event => {
        setProgress(event.percent ?? null);
      }}
    >
      <div
        className={classNames(
          'border-2',
          'border-dashed',
          'border-gray-d3',
          'hover:border-salmon-l1',
          'transition-colors',
        )}
        style={{
          display: 'flex',
          cursor: 'pointer',
          flexDirection: 'column',
          borderRadius: '8px',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '45px 20px 45px 20px',
          backgroundColor: tailwind.theme.extend.colors['gray-d5'],
          gap: 8,
        }}
      >
        <FontAwesomeIcon icon={faFile} />
        <Flexbox
          direction="column"
          alignItems="center"
          style={{
            color: tailwind.theme.extend.colors.offwhite,
          }}
        >
          <span
            style={{
              width: 'max-content',
            }}
          >
            {children}
          </span>
          <span>or</span>
        </Flexbox>
        <Flexbox alignItems="center" justifyContent="center">
          <Button
            style={{
              width: 'fit-content',
              marginBottom: '10px',
            }}
            appearance="outline"
          >
            <span>Browse Files</span>
          </Button>
        </Flexbox>
      </div>
    </RcUpload>
  );
}
