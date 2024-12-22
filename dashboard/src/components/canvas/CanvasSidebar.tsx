import { Button, Divider } from '@fluentui/react-components';
import { faTrafficLight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Stage } from 'konva/lib/Stage';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useRecoilState } from 'recoil';

import CanvasSidebarTabs from 'src/components/canvas/sidebar/CanvasSidebarTabs';
import CanvasSidebarTemplates from 'src/components/canvas/sidebar/templates/CanvasSidebarTemplates';
import CanvasSidebarTests from 'src/components/canvas/sidebar/tests/CanvasSidebarTests';
import CanvasSidebarTools from 'src/components/canvas/sidebar/tools/CanvasSidebarTools';
import CanvasSidebarTrafficHistory from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistory';
import CanvasSidebarTrafficHistoryActionModal from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistoryActionModal';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import {
  selectedCanvasSidebarTabAtom,
  selectedNamespaceActionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { CanvasSidebar_query$key } from './__generated__/CanvasSidebar_query.graphql';

const SIDEBAR_WIDTH = 320;

type Props = {
  queryRef: CanvasSidebar_query$key;
  stageRef: React.MutableRefObject<Stage | null>;
};

export default function CanvasSidebar({ queryRef, stageRef }: Props) {
  const [selectedTab, setSelectedTab] = useRecoilState(
    selectedCanvasSidebarTabAtom,
  );
  const [selectedActionIdentifier, setSelectedActionIdentifier] =
    useRecoilState(selectedNamespaceActionAtom);

  const data = useFragment(
    graphql`
      fragment CanvasSidebar_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        namespaceId: { type: "ID!" }
      ) {
        namespaceItemTemplates(organizationId: $organizationId) {
          ...CanvasSidebarTemplates_templates
        }
        namespace(namespaceId: $namespaceId) {
          status
          ...CanvasSidebarTests_namespace
          items {
            ...CanvasSidebarTools_items
          }
          actions {
            ...CanvasSidebarTrafficHistory_actions
            ...CanvasSidebarTrafficHistoryActionModal_actions
          }
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <Flexbox fullHeight>
        <Flexbox
          direction="column"
          style={{
            ...styles.container,
            width: !!selectedTab ? SIDEBAR_WIDTH : 0,
            height: !!selectedTab ? '100%' : 'auto',
            transition: 'width 0.3s ease-in-out',
          }}
        >
          <Flexbox
            alignItems="center"
            justifyContent="space-between"
            style={styles.sidebarTitle}
          >
            <Flexbox alignItems="center" gap={12}>
              {selectedTab?.icon && <FontAwesomeIcon icon={selectedTab.icon} />}
              <div>{selectedTab?.id}</div>
            </Flexbox>
            <Button
              appearance="subtle"
              icon={<Icon name="close" size={20} />}
              onClick={() => setSelectedTab(null)}
            />
          </Flexbox>
          <div>
            <Divider />
          </div>
          {selectedTab?.id === 'Tools' && (
            <CanvasSidebarTools
              itemsRef={data.namespace.items}
              stageRef={stageRef}
            />
          )}
          {selectedTab?.id === 'Templates' && (
            <CanvasSidebarTemplates
              templatesRef={data.namespaceItemTemplates}
            />
          )}
          {selectedTab?.id === 'Traffic History' && (
            <CanvasSidebarTrafficHistory
              actionsRef={data.namespace.actions}
              selectedActionIdentifier={selectedActionIdentifier}
              onClickAction={setSelectedActionIdentifier}
              showHoverActions={data.namespace.status === 'active'}
              showListActions
            />
          )}
          {selectedTab?.id === 'Tests' && (
            <CanvasSidebarTests namespaceRef={data.namespace} />
          )}
        </Flexbox>
        <div>
          <CanvasSidebarTabs />
        </div>
      </Flexbox>
      {selectedActionIdentifier && (
        <CanvasSidebarTrafficHistoryActionModal
          actionsRef={data.namespace.actions}
          isOpen={!!selectedActionIdentifier}
          toggle={() => setSelectedActionIdentifier(null)}
          title="Traffic History"
          titleIcon={faTrafficLight}
          initialActionIdentifier={selectedActionIdentifier}
          onClickAction={setSelectedActionIdentifier}
        />
      )}
    </>
  );
}

const styles = {
  container: {
    borderRadius: 4,
    backgroundColor: DokkimiColorsV2.blackSecondary,
    overflow: 'hidden',
  },
  sidebarTitle: {
    padding: '12px 12px 12px 16px',
    fontSize: 16,
  },
} satisfies Stylesheet;
