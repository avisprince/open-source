import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { graphql } from 'relay-runtime';

import {
  CanvasInfoInput,
  useAddTemplateToNamespaceMutation,
} from 'src/components/canvas/relay/__generated__/useAddTemplateToNamespaceMutation.graphql';
import {
  selectedCanvasItemsAtom,
  sessionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';

export default function useAddTemplateToNamespace() {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const setSelectedCanvasItems = useSetRecoilState(selectedCanvasItemsAtom);
  const [commitAddTemplateToNamespace, isAddInFlight] =
    useMutation<useAddTemplateToNamespaceMutation>(
      graphql`
        mutation useAddTemplateToNamespaceMutation(
          $namespaceId: ID!
          $templateId: ID!
          $canvasInfo: CanvasInfoInput!
        ) {
          addTemplateToNamespace(
            namespaceId: $namespaceId
            templateId: $templateId
            canvasInfo: $canvasInfo
          ) {
            itemId
          }
        }
      `,
    );

  const addTemplate = useCallback(
    (templateId: string, canvasInfo: CanvasInfoInput) => {
      commitAddTemplateToNamespace({
        variables: {
          namespaceId,
          templateId,
          canvasInfo,
        },
        onCompleted: response => {
          setSelectedCanvasItems(
            new Set([response.addTemplateToNamespace.itemId]),
          );
        },
      });
    },
    [commitAddTemplateToNamespace, namespaceId, setSelectedCanvasItems],
  );

  return [addTemplate, isAddInFlight] as const;
}
