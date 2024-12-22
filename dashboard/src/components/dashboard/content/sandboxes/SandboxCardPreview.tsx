import {
  faCode,
  faDatabase,
  faDiamond,
  faGlobe,
  faMicrochip,
  faTrafficLight,
  faVial,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLayoutEffect, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import SandboxCardPreviewArrow from 'src/components/dashboard/content/sandboxes/SandboxCardPreviewArrow';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { SandboxCardPreview_namespace$key } from './__generated__/SandboxCardPreview_namespace.graphql';

export const canvasIcons = {
  Service: faMicrochip,
  Database: faDatabase,
  HttpRequest: faGlobe,
  MockEndpoint: faDiamond,
  DbQuery: faCode,
  TestCase: faVial,
  QueryHistory: faTrafficLight,
  TrafficHistory: faTrafficLight,
};

type Props = {
  namespaceRef: SandboxCardPreview_namespace$key;
};

export default function SandboxCardPreview({ namespaceRef }: Props) {
  const namespace = useFragment(
    graphql`
      fragment SandboxCardPreview_namespace on Namespace {
        items {
          __typename
          itemId
          displayName
          ... on DbQuery {
            target
          }
          ... on HttpRequest {
            target
          }
          ... on MockEndpoint {
            origin
            target
          }
          canvasInfo {
            posX
            posY
          }
        }
        services {
          itemId
          domain
          canvasInfo {
            posX
            posY
          }
        }
        databases {
          itemId
          canvasInfo {
            posX
            posY
          }
        }
      }
    `,
    namespaceRef,
  );

  const itemsArrRef = useRef<(HTMLDivElement | null)[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const [box, setBox] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const [itemDims, setItemDims] = useState<
    Partial<
      Record<
        string,
        {
          width: number;
          height: number;
        }
      >
    >
  >({});

  useLayoutEffect(() => {
    const preview = previewRef.current;

    if (!preview) {
      return;
    }

    const { width, height } = preview.getBoundingClientRect();

    setBox({
      width,
      height,
    });
  }, [previewRef]);

  useLayoutEffect(() => {
    const newDims: Record<
      string,
      {
        width: number;
        height: number;
      }
    > = {};

    itemsArrRef.current.forEach(item => {
      if (!item) {
        return;
      }

      const { width, height } = item.getBoundingClientRect();

      newDims[item.id] = {
        width,
        height,
      };
    });

    setItemDims(newDims);
  }, [itemsArrRef]);

  const itemText = (type: string, displayName: string) => {
    if (type === 'QueryHistory') {
      return 'Query History';
    }

    if (type === 'TrafficHistory') {
      return 'Traffic History';
    }

    return displayName;
  };

  return (
    <div ref={previewRef} style={styles.container}>
      <div style={styles.containerBackground} />
      <div style={{ transform: `translate(0px, ${-box.height}px)` }}>
        {namespace.items.map((item, index) => {
          const {
            __typename,
            itemId,
            displayName,
            canvasInfo: { posX, posY },
          } = item;

          const itemArrowTransformation = {
            x: posX / 5,
            y: posY / 5,
            width: itemDims[itemId]?.width,
            height: itemDims[itemId]?.height,
          };

          const arrows = [];

          if (__typename === 'HttpRequest') {
            const target = namespace.services.find(
              service => service.itemId === item.target,
            );

            if (target) {
              arrows.push(
                <SandboxCardPreviewArrow
                  key={arrows.length}
                  boxWidth={box.width}
                  boxHeight={box.height}
                  p1={itemArrowTransformation}
                  p2={{
                    x: target.canvasInfo.posX / 5,
                    y: target.canvasInfo.posY / 5,
                    width: itemDims[target.itemId]?.width,
                    height: itemDims[target.itemId]?.height,
                  }}
                />,
              );
            }
          }

          if (__typename === 'MockEndpoint') {
            namespace.services.forEach(target => {
              if (item.origin === '*' || item.origin === target.domain) {
                arrows.push(
                  <SandboxCardPreviewArrow
                    key={arrows.length}
                    boxWidth={box.width}
                    boxHeight={box.height}
                    p1={{
                      x: target.canvasInfo.posX / 5,
                      y: target.canvasInfo.posY / 5,
                      width: itemDims[target.itemId]?.width,
                      height: itemDims[target.itemId]?.height,
                    }}
                    p2={itemArrowTransformation}
                  />,
                );
              }

              if (item.target === '*' || item.target === target.domain) {
                arrows.push(
                  <SandboxCardPreviewArrow
                    key={arrows.length}
                    boxWidth={box.width}
                    boxHeight={box.height}
                    p1={itemArrowTransformation}
                    p2={{
                      x: target.canvasInfo.posX / 5,
                      y: target.canvasInfo.posY / 5,
                      width: itemDims[target.itemId]?.width,
                      height: itemDims[target.itemId]?.height,
                    }}
                  />,
                );
              }
            });
          }

          if (__typename === 'DbQuery') {
            const target = namespace.databases.find(
              db => db.itemId === item.target,
            );

            if (target) {
              arrows.push(
                <SandboxCardPreviewArrow
                  key={arrows.length}
                  boxWidth={box.width}
                  boxHeight={box.height}
                  p1={itemArrowTransformation}
                  p2={{
                    x: target.canvasInfo.posX / 5,
                    y: target.canvasInfo.posY / 5,
                    width: itemDims[target.itemId]?.width,
                    height: itemDims[target.itemId]?.height,
                  }}
                />,
              );
            }
          }

          if (__typename === 'TrafficHistory') {
            const [id1, id2] = displayName.split('-');
            namespace.services.forEach(target => {
              if (target.itemId === id1 || target.itemId === id2) {
                arrows.push(
                  <SandboxCardPreviewArrow
                    key={arrows.length}
                    boxWidth={box.width}
                    boxHeight={box.height}
                    p1={itemArrowTransformation}
                    p2={{
                      x: target.canvasInfo.posX / 5,
                      y: target.canvasInfo.posY / 5,
                      width: itemDims[target.itemId]?.width,
                      height: itemDims[target.itemId]?.height,
                    }}
                  />,
                );
              }
            });
          }

          if (__typename === 'QueryHistory') {
            const [id1, id2] = displayName.split('-');
            namespace.services.forEach(target => {
              if (target.itemId === id1) {
                arrows.push(
                  <SandboxCardPreviewArrow
                    key={arrows.length}
                    boxWidth={box.width}
                    boxHeight={box.height}
                    p1={{
                      x: target.canvasInfo.posX / 5,
                      y: target.canvasInfo.posY / 5,
                      width: itemDims[target.itemId]?.width,
                      height: itemDims[target.itemId]?.height,
                    }}
                    p2={itemArrowTransformation}
                  />,
                );
              }
            });

            namespace.databases.forEach(target => {
              if (target.itemId === id2) {
                arrows.push(
                  <SandboxCardPreviewArrow
                    key={arrows.length}
                    boxWidth={box.width}
                    boxHeight={box.height}
                    p1={itemArrowTransformation}
                    p2={{
                      x: target.canvasInfo.posX / 5,
                      y: target.canvasInfo.posY / 5,
                      width: itemDims[target.itemId]?.width,
                      height: itemDims[target.itemId]?.height,
                    }}
                  />,
                );
              }
            });
          }

          const icon = canvasIcons[__typename as keyof typeof canvasIcons];

          return (
            <div key={index}>
              <div
                style={{
                  position: 'absolute',
                  transform: `translate(${posX / 5}px, ${posY / 5}px)`,
                }}
              >
                <div
                  id={itemId}
                  ref={el => {
                    itemsArrRef.current[index] = el;
                  }}
                  style={styles.node}
                >
                  <FontAwesomeIcon icon={icon} />
                  <div style={styles.nodeText}>
                    {itemText(__typename, displayName)}
                  </div>
                </div>
              </div>
              <div style={styles.arrows}>{arrows}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  arrows: {
    position: 'absolute',
    zIndex: -2,
  },
  container: {
    flexGrow: 1,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  containerBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: DokkimiColorsV2.blackPrimary,
  },
  node: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    justifyContent: 'center',
    position: 'absolute',
    gap: 8,
    borderRadius: 8,
    minWidth: 40,
    maxWidth: 160,
    height: 40,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    zIndex: 3,
    boxShadow: '0px 0px 5px 1px rgba(20,20,20,1)',
  },
  nodeText: {
    borderRadius: 4,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
} satisfies Stylesheet;
