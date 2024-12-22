import { Button, Checkbox, Input, Switch } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cronstrue from 'cronstrue';
import { useEffect, useMemo, useState } from 'react';
import { Cron } from 'react-js-cron';
import 'react-js-cron/dist/styles.css';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import CollapsibleSection from 'src/components/dashboard/content/tests/custom/CollapsibleSection';
import useCreateTestSuite from 'src/components/dashboard/content/tests/hooks/useCreateTestSuite';
import useUpdateTestSuite from 'src/components/dashboard/content/tests/hooks/useUpdateTestSuite';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { TestEditModalQuery } from './__generated__/TestEditModalQuery.graphql';
import { TestEditModal_testSuite$key } from './__generated__/TestEditModal_testSuite.graphql';

const DEFAULT_CRON_VALUE = '0 * * * *';
const INVALID_CRON_VALUE = '* * * * *';

type Props = {
  testEditModalRef: TestEditModal_testSuite$key | null;
  onModalClose: () => void;
  show: boolean;
};

export default function TestEditModal({
  testEditModalRef,
  onModalClose,
  show,
}: Props) {
  const { orgId } = useRecoilValue(sessionAtom);

  const testSuite = useFragment(
    graphql`
      fragment TestEditModal_testSuite on TestSuite {
        id
        name
        schedule
        namespaces {
          id
        }
      }
    `,
    testEditModalRef,
  );

  const data = useLazyLoadQuery<TestEditModalQuery>(
    graphql`
      query TestEditModalQuery($organizationId: ID!, $skipOrgQuery: Boolean!) {
        namespaces(organizationId: $organizationId, type: "sandbox")
          @skip(if: $skipOrgQuery) {
          id
          name
          testCases {
            __typename
          }
        }
      }
    `,
    {
      organizationId: orgId,
      skipOrgQuery: !orgId,
    },
  );

  const [name, setName] = useState<string>('');
  const [scheduled, setScheduled] = useState<boolean>(false);
  const [cronValue, setCronValue] = useState<string>(DEFAULT_CRON_VALUE);
  const [namespaceIds, setNamespaceIds] = useState<string[]>([]);
  const [namespaceFilter, setNamespaceFilter] = useState<string>('');

  useEffect(() => {
    setName(testSuite?.name ?? '');
    setScheduled(!!testSuite?.schedule);
    setCronValue(testSuite?.schedule ?? DEFAULT_CRON_VALUE);
    setNamespaceIds(testSuite?.namespaces.map(ns => ns.id) ?? []);
  }, [testSuite]);

  const filteredNamespaces = useMemo(() => {
    return (
      data.namespaces?.filter(ns =>
        ns.name
          .toLocaleLowerCase()
          .includes(namespaceFilter.toLocaleLowerCase()),
      ) ?? []
    );
  }, [data, namespaceFilter]);

  const [createTestSuite] = useCreateTestSuite();
  const [updateTestSuite] = useUpdateTestSuite();

  const onSave = () => {
    const input = {
      name,
      schedule:
        !scheduled || cronValue === INVALID_CRON_VALUE ? null : cronValue,
      namespaces: namespaceIds,
    };

    if (!testSuite) {
      createTestSuite(input);
    } else {
      updateTestSuite(testSuite.id, input);
    }

    onModalClose();
  };

  const onToggleNamespace = (namespaceId: string) => {
    setNamespaceIds(curr => {
      return curr.includes(namespaceId)
        ? curr.filter(ns => ns !== namespaceId)
        : [...curr, namespaceId];
    });
  };

  const title = !!testSuite ? 'Edit Test Suite' : 'New Test Suite';
  const confirmButtonText = !!testSuite ? 'Confirm Changes' : 'Create';

  return (
    <DokkimiModal width={660} isOpen={show} toggle={onModalClose}>
      <Flexbox direction="column" gap={32} style={styles.modalContent}>
        <div style={styles.modalTitle}>{title}</div>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
        />
        {/* <CollapsibleSection
          headerIcon={<FontAwesomeIcon icon={faClock} />}
          headerText="Test Schedule"
          headerSubtext={
            scheduled ? cronstrue.toString(cronValue) : 'Not scheduled'
          }
          headerActions={
            <Switch
              checked={scheduled}
              onChange={e => setScheduled(e.currentTarget.checked)}
            />
          }
          expanded={false}
        >
          <Flexbox
            style={styles.scheduleContainer}
            justifyContent="space-between"
            alignItems="end"
          >
            <Cron
              value={cronValue}
              setValue={setCronValue}
              defaultPeriod="hour"
              allowedPeriods={['year', 'month', 'week', 'day', 'hour']}
              clearButton={false}
            />
            <Button
              appearance="primary"
              style={styles.cronClearButton}
              onClick={() => setCronValue(DEFAULT_CRON_VALUE)}
            >
              Reset
            </Button>
          </Flexbox>
        </CollapsibleSection> */}
        <CollapsibleSection
          headerIcon={<FontAwesomeIcon icon={faVial} />}
          headerText="Tests to run"
          headerActions={<div>{namespaceIds.length} selected</div>}
        >
          <Flexbox direction="column" gap={12}>
            <Input
              value={namespaceFilter}
              onChange={e => setNamespaceFilter(e.target.value)}
              placeholder="Search name of tests to add"
              style={styles.namespacesFilter}
              contentAfter={<SearchRegular />}
              appearance="underline"
            />
            <Flexbox
              direction="column"
              gap={12}
              style={styles.namespacesContainer}
            >
              {filteredNamespaces.map(namespace => (
                <Flexbox key={namespace.id} gap={8} alignItems="center">
                  <Checkbox
                    checked={namespaceIds.includes(namespace.id)}
                    onChange={() => onToggleNamespace(namespace.id)}
                  />
                  <Flexbox
                    alignItems="center"
                    justifyContent="space-between"
                    fullWidth
                  >
                    <Link to={`/sandboxes/${namespace.id}`} target="_blank">
                      {namespace.name}
                    </Link>
                    <div>{namespace.testCases.length} test cases</div>
                  </Flexbox>
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        </CollapsibleSection>
        <Flexbox alignItems="center" justifyContent="space-between">
          <Button appearance="primary" onClick={onSave} disabled={!name}>
            {confirmButtonText}
          </Button>
        </Flexbox>
      </Flexbox>
    </DokkimiModal>
  );
}

const styles = {
  cronClearButton: {
    height: 32,
    marginBottom: 8,
  },
  modal: {
    width: 600,
    maxWidth: 600,
  },
  modalBody: {
    width: '100%',
    color: 'white',
    padding: 0,
  },
  modalContent: {
    padding: 48,
  },
  modalTitle: {
    fontSize: 28,
  },
  namespacesContainer: {
    height: 220,
    overflowY: 'auto',
  },
  namespacesFilter: {
    width: '100%',
  },
  scheduleContainer: {
    padding: '8px 4px 0 4px',
  },
} satisfies Stylesheet;
