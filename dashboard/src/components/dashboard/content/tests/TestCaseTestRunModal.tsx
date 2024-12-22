import { Divider } from '@fluentui/react-components';
import { CheckmarkRegular, DismissRegular } from '@fluentui/react-icons';
import { faFileCode } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import ActionResponseText from 'src/components/canvas/sidebar/shared/ActionResponseText';
import TestCaseAssertionSchemaEditor from 'src/components/canvas/sidebar/shared/TestCaseAssertionSchemaEditor';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import DokkimiModalTitle from 'src/components/custom/DokkimiModalTitle';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';

import { TestCaseTestRunModal_testCase$key } from './__generated__/TestCaseTestRunModal_testCase.graphql';

type Props = {
  testCaseRef: TestCaseTestRunModal_testCase$key;
  isOpen: boolean;
  onClose: () => void;
};

export default function TestCaseTestRunModal({
  testCaseRef,
  isOpen,
  onClose,
}: Props) {
  const styles = useStyles();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const testCase = useFragment(
    graphql`
      fragment TestCaseTestRunModal_testCase on TestRunTestCase {
        testCaseName
        assertions {
          schema
          success
          action {
            type
            ...ActionRequestText_action
            ...ActionResponseText_action
            ...TestCaseAssertionSchemaEditor_action
          }
        }
      }
    `,
    testCaseRef,
  );

  const selectedAssertion = testCase.assertions[selectedIndex] ?? null;

  return (
    <DokkimiModal
      isOpen={isOpen}
      toggle={onClose}
      showCloseButton
      showHeaderDivider
      title={
        <DokkimiModalTitle icon={faFileCode} title={testCase.testCaseName} />
      }
    >
      <Flexbox fullWidth style={{ minHeight: 540 }}>
        <div className={styles.sidebar}>
          <Flexbox direction="column" gap={4} className={styles.assertionsList}>
            {testCase.assertions.map(({ action, success }, index) => {
              return (
                <Flexbox
                  key={index}
                  alignItems="center"
                  gap={8}
                  shrink={0}
                  className={clsx(styles.assertion, {
                    [styles.assertionHovered]:
                      hoveredIndex === index || selectedIndex === index,
                  })}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedIndex(index)}
                >
                  <Flexbox alignItems="center" justifyContent="center">
                    {success ? (
                      <CheckmarkRegular
                        fontSize={20}
                        color={DokkimiColorsV2.greenSuccess}
                      />
                    ) : (
                      <DismissRegular
                        fontSize={20}
                        color={DokkimiColorsV2.accentPrimary}
                      />
                    )}
                  </Flexbox>
                  {action.type === 'request' ? (
                    <ActionRequestText actionRef={action} />
                  ) : (
                    <ActionResponseText actionRef={action} />
                  )}
                </Flexbox>
              );
            })}
          </Flexbox>
        </div>
        <div>
          <Divider vertical className={styles.divider} />
        </div>
        {selectedAssertion && (
          <TestCaseAssertionSchemaEditor
            key={selectedIndex}
            actionRef={selectedAssertion.action}
            assertionSchema={selectedAssertion.schema}
            readOnly={true}
          />
        )}
      </Flexbox>
    </DokkimiModal>
  );
}

const useStyles = createUseStyles({
  assertion: {
    height: 32,
    padding: '8px 12px',
    borderRadius: 8,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  assertionHovered: {
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    fontWeight: 'bold',
  },
  assertionsList: {
    height: '100%',
    padding: 12,
    overflowY: 'auto',
  },
  divider: {
    height: '100%',
  },
  sidebar: {
    width: 300,
    flexShrink: 0,
    overflow: 'hidden',
  },
});
