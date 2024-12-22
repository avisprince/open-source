import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import TextWithSubtext from 'src/components/custom/TextWithSubtext';
import EditDeleteMenu from 'src/components/dashboard/content/shared/EditDeleteMenu';
import DatabaseTempateForm from 'src/components/dashboard/content/templates/forms/DatabaseTemplateForm';
import DbQueryTemplateForm from 'src/components/dashboard/content/templates/forms/DbQueryTemplateForm';
import HttpRequestTemplateForm from 'src/components/dashboard/content/templates/forms/HttpRequestTemplateForm';
import MockEndpointTemplateForm from 'src/components/dashboard/content/templates/forms/MockEndpointTemplateForm';
import ServiceTemplateForm from 'src/components/dashboard/content/templates/forms/ServiceTemplateForm';
import useDeleteTemplate from 'src/components/dashboard/content/templates/hooks/useDeleteTemplate';
import {
  TemplateIcons,
  TemplateType,
} from 'src/components/dashboard/content/templates/templateTypes';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { TemplateCard_template$key } from './__generated__/TemplateCard_template.graphql';

type Props = {
  templateRef: TemplateCard_template$key;
};

export default function TemplateCard({ templateRef }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);

  const { id, template, updatedAt } = useFragment(
    graphql`
      fragment TemplateCard_template on NamespaceItemTemplate {
        id
        template {
          displayName
          itemType
          ...ServiceTemplateForm_serviceBase
          ...DatabaseTemplateForm_databaseBase
          ...HttpRequestTemplateForm_httpRequestBase
          ...DbQueryTemplateForm_dbQueryBase
          ...MockEndpointTemplateForm_mockEndpointBase
        }
        updatedAt
      }
    `,
    templateRef,
  );

  const [deleteTemplate] = useDeleteTemplate();
  const onDelete = () => {
    if (id) {
      deleteTemplate(id);
    }
  };

  const onCloseEditModal = () => {
    setShowEditModal(false);
  };

  const templateForm = useMemo(() => {
    if (!id) {
      return null;
    }

    switch (template.itemType as TemplateType) {
      case 'Service': {
        return (
          <ServiceTemplateForm
            serviceRef={template}
            isDisabled={false}
            templateId={id}
            onSave={onCloseEditModal}
          />
        );
      }
      case 'Database': {
        return (
          <DatabaseTempateForm
            databaseRef={template}
            isDisabled={false}
            templateId={id}
            onSave={onCloseEditModal}
          />
        );
      }
      case 'HttpRequest': {
        return (
          <HttpRequestTemplateForm
            httpRequestRef={template}
            isDisabled={false}
            templateId={id}
            onSave={onCloseEditModal}
          />
        );
      }
      case 'DbQuery': {
        return (
          <DbQueryTemplateForm
            dbQueryRef={template}
            isDisabled={false}
            templateId={id}
            onSave={onCloseEditModal}
          />
        );
      }
      case 'MockEndpoint': {
        return (
          <MockEndpointTemplateForm
            mockEndpointRef={template}
            isDisabled={false}
            templateId={id}
            onSave={onCloseEditModal}
          />
        );
      }
      default: {
        return null;
      }
    }
  }, [id, template]);

  return (
    <Flexbox
      alignItems="center"
      justifyContent="space-between"
      style={styles.card}
    >
      <Flexbox alignItems="center" gap={16}>
        <FontAwesomeIcon
          icon={TemplateIcons[template.itemType as TemplateType]}
          size="lg"
        />
        <TextWithSubtext
          text={template.displayName}
          subtext={`Updated ${dayjs(updatedAt).fromNow()}`}
        />
      </Flexbox>
      <EditDeleteMenu
        onEdit={() => setShowEditModal(true)}
        onDelete={onDelete}
      />
      <DokkimiModal
        showCloseButton
        toggle={onCloseEditModal}
        isOpen={showEditModal}
        width={600}
      >
        <Flexbox
          alignItems="center"
          justifyContent="center"
          direction="column"
          gap={16}
          style={styles.modalContent}
        >
          <div>Edit Template</div>
          <div style={styles.form}>{templateForm}</div>
        </Flexbox>
      </DokkimiModal>
    </Flexbox>
  );
}

const styles = {
  card: {
    height: 80,
    width: 'calc(50% - 8px)',
    padding: 16,
    borderRadius: 4,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
  },
  form: {
    width: '80%',
    padding: 16,
  },
  modalContent: {
    paddingBottom: 20,
  },
} satisfies Stylesheet;
