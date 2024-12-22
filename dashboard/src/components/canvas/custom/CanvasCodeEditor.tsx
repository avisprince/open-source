import {
  ArrowExpand20Filled,
  CodeText20Regular,
  Copy20Regular,
} from '@fluentui/react-icons';
import Editor from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import { useState } from 'react';

import { CanvasButton } from 'src/components/canvas/custom/CanvasButton';
import CanvasCodeEditorModal from 'src/components/canvas/custom/CanvasCodeEditorModal';
import useCodeEditor from 'src/components/canvas/custom/useCodeEditor';
import Flexbox from 'src/components/custom/Flexbox';
import stylist from 'src/components/styles/stylist';
import { Stylesheet } from 'src/types/Stylesheet';
import { emptyFunction } from 'src/util/util';

type Props = {
  pointerEvents?: 'auto' | 'none';
  style?: React.CSSProperties;
  title: string;
  modalTitle?: string;
  language?: 'json' | 'sql';
  height: number;
  value: string;
  readOnly?: boolean;
  onChange?: (val: string) => void;
  hideExpand?: boolean;
};

export function CanvasCodeEditor({
  pointerEvents = 'auto',
  style = {},
  title,
  modalTitle,
  language = 'json',
  height,
  value,
  readOnly = false,
  onChange = emptyFunction,
  hideExpand = false,
}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { code, onCodeChange, onPrettify } = useCodeEditor({
    value,
    readOnly,
    onChange,
  });

  return (
    <>
      <Flexbox
        direction="column"
        gap={8}
        style={stylist([styles.container, style, { pointerEvents, height }])}
      >
        <Flexbox alignItems="center" justifyContent="space-between">
          <div>{title}</div>
          <Flexbox alignItems="center" gap={4}>
            {!readOnly && (
              <CanvasButton
                pointerEvents={pointerEvents}
                appearance="subtle"
                icon={<CodeText20Regular />}
                onClick={() => onPrettify()}
              />
            )}
            <CanvasButton
              pointerEvents={pointerEvents}
              appearance="subtle"
              icon={<Copy20Regular />}
              onClick={() => copy(code)}
            />
            {!hideExpand && (
              <CanvasButton
                pointerEvents={pointerEvents}
                appearance="subtle"
                icon={<ArrowExpand20Filled />}
                onClick={() => setShowModal(true)}
              />
            )}
          </Flexbox>
        </Flexbox>
        <div style={styles.editor}>
          <Editor
            theme="vs-dark"
            defaultLanguage={language}
            value={code}
            onChange={val => onCodeChange(val || '')}
            options={{
              minimap: {
                enabled: false,
              },
              tabSize: 2,
              readOnly,
              automaticLayout: true,
            }}
          />
        </div>
      </Flexbox>
      <CanvasCodeEditorModal
        modalTitle={modalTitle ?? title}
        pointerEvents={pointerEvents}
        language={language}
        readOnly={readOnly}
        showModal={showModal}
        closeModal={() => setShowModal(false)}
        value={code}
        onChange={onCodeChange}
      />
    </>
  );
}

const styles: Stylesheet = {
  container: {
    width: '100%',
  },
  editor: {
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
};
