import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';

import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Vector2d } from 'src/types/Canvas';

type Props = {
  children: JSX.Element[];
  sortingEnabled: boolean;
  onOrderChange: (startIndex: number, endIndex: number) => void;
};

export default function SortableList({
  children,
  sortingEnabled,
  onOrderChange,
}: Props) {
  const styles = useStyles();
  const [dragged, setDragged] = useState<number | null>(null);
  const [mouse, setMouse] = useState<Vector2d>({ x: 0, y: 0 });
  const [dropZone, setDropZone] = useState(0);

  useEffect(() => {
    document.body.style.cursor = dragged !== null ? 'grabbing' : 'default';
  }, [dragged]);

  useEffect(() => {
    if (dragged !== null) {
      // get all drop-zones
      const elements = Array.from(document.getElementsByClassName('drop-zone'));

      // get all drop-zones' y-axis position
      // if we were using a horizontally-scrolling list, we would get the .left property
      const positions = elements.map(e => e.getBoundingClientRect().top);
      // get the difference with the mouse's y position
      const absDifferences = positions.map(v => Math.abs(v - mouse.y));

      // get the item closest to the mouse
      let result = absDifferences.indexOf(Math.min(...absDifferences));

      // if the item is below the dragged item, add 1 to the index
      if (result > dragged) result += 1;

      setDropZone(result);
    }
  }, [dragged, mouse]);

  useEffect(() => {
    const handler = ({ x, y }: MouseEvent) => {
      if (dragged !== null) {
        setMouse({ x, y });
      }
    };

    document.addEventListener('mousemove', handler);

    return () => document.removeEventListener('mousemove', handler);
  }, [dragged]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dragged !== null) {
        e.preventDefault();
        setDragged(null);
        onOrderChange(dragged, dropZone);
      }
    };

    document.addEventListener('mouseup', handler);

    return () => document.removeEventListener('mouseup', handler);
  }, [dragged, dropZone, onOrderChange]);

  return (
    <Flexbox direction="column" fullWidth className={styles.container}>
      {dragged !== null && (
        <div
          className={styles.floating}
          style={{
            left: mouse.x - 16,
            top: mouse.y - 16,
          }}
        >
          {children[dragged]}
        </div>
      )}
      <Flexbox direction="column">
        <DropZone isHidden={dragged === null || dropZone !== 0} />
        {children.map((value, index) => (
          <React.Fragment key={index}>
            {dragged !== index && (
              <>
                <div
                  className={clsx({
                    [styles.grab]: dragged === null && sortingEnabled,
                    [styles.grabbing]: dragged !== null,
                  })}
                  onMouseDown={e => {
                    if (sortingEnabled) {
                      e.preventDefault();
                      setDragged(index);
                      setMouse({ x: e.clientX, y: e.clientY });
                    }
                  }}
                >
                  {value}
                </div>
                <DropZone
                  isHidden={dragged === null || dropZone !== index + 1}
                />
              </>
            )}
          </React.Fragment>
        ))}
      </Flexbox>
    </Flexbox>
  );
}

type DropZoneProps = {
  isHidden: boolean;
};

function DropZone({ isHidden }: DropZoneProps) {
  const styles = useStyles();

  return (
    <div
      className={
        'drop-zone ' +
        clsx(styles.dropZone, {
          [styles.hidden]: isHidden,
        })
      }
    />
  );
}

const useStyles = createUseStyles({
  container: {
    overflowY: 'auto',
  },
  dropZone: {
    height: 2,
    backgroundColor: DokkimiColorsV2.accentPrimary,
    transitionProperty: 'height padding',
    transitionDuration: '250ms',
    transitionTimingFunction: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    overflow: 'hidden',
  },
  floating: {
    position: 'absolute',
    width: '80%',
    cursor: 'grabbing',
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    borderRadius: 8,
  },
  grab: {
    cursor: 'grab',
  },
  grabbing: {
    cursor: 'grabbing',
  },
  hidden: {
    height: 0,
    padding: 0,
  },
});
