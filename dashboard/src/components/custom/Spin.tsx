import { SVGAttributes } from 'react';
import tailwind from 'tailwind';

type Props = {
  width?: number;
} & SVGAttributes<SVGSVGElement>;

export default function Spin({ width = 40, ...rest }: Props) {
  return (
    <svg {...rest} width={`${width}px`} viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke={tailwind.theme.extend.colors.salmon}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        mask="url(#spinner-mask)"
      >
        <animate
          attributeName="stroke-dashoffset"
          dur="1s"
          repeatCount="indefinite"
          from="0"
          to="-275"
        />
        <animate
          attributeName="stroke-dasharray"
          dur="1s"
          repeatCount="indefinite"
          values="80 200"
        />
      </circle>
    </svg>
  );
}
