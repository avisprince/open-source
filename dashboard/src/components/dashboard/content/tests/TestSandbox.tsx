import dayjs from 'dayjs';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { Link } from 'react-router-dom';

import DokkimiLink from 'src/components/custom/DokkimiLink';
import Flexbox from 'src/components/custom/Flexbox';
import RightDownChevron from 'src/components/custom/RightDownChevron';
import TestCase from 'src/components/dashboard/content/tests/TestCase';
import TestRunResultBlock from 'src/components/dashboard/content/tests/TestRunResultBlock';
import useExpandedTests from 'src/components/dashboard/content/tests/hooks/useExpandedTests';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { TestSandbox_namespace$key } from './__generated__/TestSandbox_namespace.graphql';
import { TestSandbox_testSuite$key } from './__generated__/TestSandbox_testSuite.graphql';

type Props = {
  namespaceRef: TestSandbox_namespace$key;
  testSuiteRef: TestSandbox_testSuite$key;
};

export default function TestSandbox({ namespaceRef, testSuiteRef }: Props) {
  const namespace = useFragment(
    graphql`
      fragment TestSandbox_namespace on Namespace {
        id
        name
        testCases {
          id
          ...TestCase_testCase
        }
        actions {
          ...TestCase_actions
        }
      }
    `,
    namespaceRef,
  );

  const testSuite = useFragment(
    graphql`
      fragment TestSandbox_testSuite on TestSuite {
        id
        testRuns {
          startTime
          success
        }
        namespaceSuccessRates {
          id
          successRate
        }
        ...TestCase_testSuite
      }
    `,
    testSuiteRef,
  );

  const [isExpanded, toggleTest] = useExpandedTests(
    `${testSuite.id}-${namespace.id}`,
  );

  const successRate = useMemo(() => {
    const ns = testSuite.namespaceSuccessRates.find(
      ns => ns.id === namespace.id,
    );
    return ns?.successRate ?? 0;
  }, [testSuite.namespaceSuccessRates, namespace.id]);

  const testRunsResults = useMemo(() => {
    return testSuite.testRuns.slice(0, 10).map(testRun => !!testRun.success);
  }, [testSuite.testRuns]);

  return (
    <Flexbox direction="column" style={styles.container}>
      <Flexbox alignItems="center" justifyContent="space-between">
        <Flexbox alignItems="center" gap={4} style={{ width: '33%' }}>
          <RightDownChevron isExpanded={isExpanded} onClick={toggleTest} />
          <DokkimiLink>
            <Link to={`/sandboxes/${namespace.id}`} target="_blank">
              {namespace.name}
            </Link>
          </DokkimiLink>
        </Flexbox>
        <Flexbox
          alignItems="center"
          justifyContent="center"
          style={{ width: '33%' }}
        >
          {!isExpanded && (
            <Flexbox alignItems="center" gap={8}>
              {testRunsResults.map((result, index) => {
                const tooltip = dayjs(
                  testSuite.testRuns[index].startTime,
                ).format('MM/DD/YY hh:mma');

                return (
                  <TestRunResultBlock
                    success={result}
                    tooltip={tooltip}
                    key={index}
                  />
                );
              })}
            </Flexbox>
          )}
        </Flexbox>
        <div style={styles.successRate}>{successRate * 100}%</div>
      </Flexbox>
      {isExpanded && (
        <Flexbox direction="column" style={styles.testCases}>
          {namespace.testCases.map((test, index) => {
            return (
              <TestCase
                key={test.id}
                testCaseRef={test}
                testSuiteRef={testSuite}
                actionsRef={namespace.actions}
                showDivider={index !== namespace.testCases.length - 1}
              />
            );
          })}
        </Flexbox>
      )}
    </Flexbox>
  );
}

const styles = {
  container: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: DokkimiColorsV2.blackSecondary,
  },
  testCase: {
    height: 55,
    paddingLeft: 40,
  },
  testCases: {
    padding: '8px 16px',
  },
  successRate: {
    textAlign: 'end',
    width: '33%',
    paddingRight: 52,
  },
} satisfies Stylesheet;
