import { Input } from '@fluentui/react-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';
import { useSetRecoilState } from 'recoil';

import { CanvasItemType } from 'src/components/canvas/Canvas';
import Flexbox from 'src/components/custom/Flexbox';
import {
  TemplateIcons,
  TemplateType,
} from 'src/components/dashboard/content/templates/templateTypes';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { newCanvasItemDragTypeAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { CanvasSidebarTemplates_templates$key } from './__generated__/CanvasSidebarTemplates_templates.graphql';

type Props = {
  templatesRef: CanvasSidebarTemplates_templates$key;
};

export default function CanvasSidebarTemplates({ templatesRef }: Props) {
  const styles = useStyles();
  const setDragType = useSetRecoilState(newCanvasItemDragTypeAtom);
  const [templateFilter, setTemplateFilter] = useState('');

  const templates = useFragment(
    graphql`
      fragment CanvasSidebarTemplates_templates on NamespaceItemTemplate
      @relay(plural: true) {
        id
        template {
          itemType
          displayName
        }
      }
    `,
    templatesRef,
  );

  return (
    <Flexbox direction="column" gap={8} className={styles.container}>
      <div>Drag in a Template</div>
      <Input
        value={templateFilter}
        onChange={e => setTemplateFilter(e.target.value)}
        placeholder="Search..."
      />
      <Flexbox direction="column" className={styles.templatesList}>
        {templates
          .filter(({ template }) =>
            template.displayName
              .toLocaleLowerCase()
              .includes(templateFilter.toLocaleLowerCase()),
          )
          .sort((a, b) =>
            a.template.displayName < b.template.displayName ? -1 : 1,
          )
          .map(({ id, template }) => (
            <Flexbox
              key={id}
              alignItems="center"
              gap={12}
              className={clsx(styles.template)}
              draggable
              onDragStart={() => {
                setDragType({
                  templateId: id,
                  type: template.itemType as CanvasItemType,
                });
              }}
            >
              <Flexbox
                alignItems="center"
                justifyContent="center"
                className={styles.templateIcon}
              >
                <FontAwesomeIcon
                  icon={TemplateIcons[template.itemType as TemplateType]}
                  size="lg"
                />
              </Flexbox>
              <div className={styles.templateText}>{template.displayName}</div>
            </Flexbox>
          ))}
      </Flexbox>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  container: {
    padding: 12,
    overflow: 'hidden',
  },
  templatesList: {
    overflowY: 'auto',
  },
  template: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: 4,

    '&:hover': {
      color: DokkimiColorsV2.accentPrimary,
      backgroundColor: DokkimiColorsV2.blackQuaternary,
      fontWeight: 'bold',
    },
  },
  templateIcon: {
    width: 24,
  },
  templateText: {
    color: DokkimiColorsV2.white,
  },
});
