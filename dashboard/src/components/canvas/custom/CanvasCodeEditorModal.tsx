import {
  CodeText20Regular,
  Copy20Regular,
  Dismiss20Filled,
} from '@fluentui/react-icons';
import Editor from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import { useEffect } from 'react';

import { CanvasButton } from 'src/components/canvas/custom';
import useCodeEditor from 'src/components/canvas/custom/useCodeEditor';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  pointerEvents: 'auto' | 'none';
  modalTitle?: string;
  language?: 'json' | 'sql';
  readOnly?: boolean;
  showModal: boolean;
  closeModal: () => void;
  value: string;
  onChange: (val: string) => void;
};

export default function CanvasCodeEditorModal({
  pointerEvents,
  modalTitle,
  language,
  readOnly,
  showModal,
  closeModal,
  value,
  onChange,
}: Props) {
  const { code, onCodeChange, onPrettify } = useCodeEditor({
    value,
    readOnly,
    onChange,
  });

  useEffect(() => {
    if (showModal && code !== value) {
      onCodeChange(value);
    }
  }, [showModal, code, value, onCodeChange]);

  return (
    <DokkimiModal isOpen={showModal} toggle={closeModal}>
      <div style={styles.modalBodyContent}>
        <Flexbox
          alignItems="center"
          justifyContent="space-between"
          style={styles.modalTitle}
        >
          <div>{modalTitle}</div>
          <Flexbox alignItems="center" gap={4}>
            {!readOnly && (
              <CanvasButton
                pointerEvents={pointerEvents}
                appearance="subtle"
                icon={<CodeText20Regular />}
                onClick={onPrettify}
              />
            )}
            <CanvasButton
              pointerEvents={pointerEvents}
              appearance="subtle"
              icon={<Copy20Regular />}
              onClick={() => copy(code)}
            />
            <CanvasButton
              pointerEvents={pointerEvents}
              appearance="subtle"
              icon={<Dismiss20Filled />}
              onClick={closeModal}
            />
          </Flexbox>
        </Flexbox>
        <div style={styles.modalEditor}>
          <Editor
            theme="vs-dark"
            defaultLanguage={language}
            value={code}
            onChange={val => onCodeChange(val || '')}
            onMount={editor => {
              editor.onKeyDown((e: KeyboardEvent) => {
                if (e.code === 'Tab') {
                  e.preventDefault();
                  if (e.shiftKey) {
                    editor.trigger('keyboard', 'outdent');
                  } else {
                    editor.trigger('keyboard', 'type', { text: '  ' });
                  }
                  editor.focus();
                }
              });
            }}
            options={{
              minimap: {
                enabled: true,
              },
              tabSize: 2,
              readOnly,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </DokkimiModal>
  );
}

const styles = {
  modalTitle: {
    marginBottom: 8,
    color: 'white',
  },
  modalBodyContent: {
    padding: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalEditor: {
    height: '60vh',
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
} satisfies Stylesheet;
