import Color from 'color';
import { reduce } from 'lodash/fp';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const parallax = {
  factor: 0.9,
};

const colors = {
  offwhite: '#d6d6d6',
  gray: '#606060',
  primary: '#f4718f',
  'primary-strong': '#d1103d',
  salmon: '#ff6063',

  blackPrimary: '#202020',
  blackSecondary: '#272727',
  blackTertiary: '#2D2D2D',
  blackQuaternary: '#343434',

  accentPrimary: '#FF6063',
};

type ColorsKey = keyof typeof colors;
const shades = ['light', 'lighter', 'dark', 'darker'] as const;
type Shades = (typeof shades)[number];
type Variants =
  | `${ColorsKey}-${Shades}`
  | `${ColorsKey}-${'l' | 'd'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

const colorsWithVariants = {
  ...colors,
  ...reduce<[ColorsKey, string], Record<Variants, string>>(
    (acc, [color, hex]) => {
      const brightness = Object.fromEntries(
        Array.from({ length: 9 }).map((_, i) => {
          const index = i + 1;

          return [
            `${color}-l${index}`,
            Color(hex)
              .lighten(index / 10)
              .hex(),
          ];
        }),
      );

      const darkness = Object.fromEntries(
        Array.from({ length: 9 }).map((_, i) => {
          const index = i + 1;

          return [
            `${color}-d${index}`,
            Color(hex)
              .darken(index / 11.3)
              .hex(),
          ];
        }),
      );

      return {
        ...acc,
        ...brightness,
        ...darkness,
        [`${color}-light`]: brightness[`${color}-l4`],
        [`${color}-lighter`]: brightness[`${color}-l8`],
        [`${color}-dark`]: darkness[`${color}-d5`],
        [`${color}-darker`]: darkness[`${color}-d6`],
      } as Record<Variants, string>;
    },
    {} as Record<Variants, string>,
    Object.entries(colors) as [ColorsKey, string][],
  ),
};

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    parallax,
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      screens: {
        xs: '475px',
      },
      colors: {
        black: '#000000',
        white: '#ffffff',
        ...colorsWithVariants,
      },
      textShadow: {
        DEFAULT: `0 0 1px black, 2px 0 1px rgba(0, 0, 0, 0.75),
    -2px 0 1px rgba(0, 0, 0, 0.75), 0 2px 1px rgba(0, 0, 0, 0.75),
    0 -2px 1px rgba(0, 0, 0, 0.75)`,
        sm: '0 1px 2px rgba(0, 0, 0, 0.75)',
        md: '0 2px 4px rgba(0, 0, 0, 0.75)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.75)',
      },
      boxShadow: {
        soft: `0 0 ${5 / parallax.factor}px 1px rgba(0, 0, 0, 0.25)`,
        hard: `0 0 ${5 / parallax.factor}px 1px rgba(0, 0, 0, 0.75)`,
        item: `${15 / parallax.factor}px ${15 / parallax.factor}px ${
          20 / parallax.factor
        }px 4px rgba(0, 0, 0, 0.35)`,
        below: `0 2px 2px 1px rgba(0, 0, 0, 0.25)`,
        above: `0 -${5 / parallax.factor}px ${
          5 / parallax.factor
        }px 1px rgba(0, 0, 0, 0.25)`,
        before: `-${5 / parallax.factor}px 0 ${
          5 / parallax.factor
        }px 1px rgba(0, 0, 0, 0.25)`,
        after: `${5 / parallax.factor}px 0 ${
          5 / parallax.factor
        }px 1px rgba(0, 0, 0, 0.25)`,
        'soft-below': `0 ${5 / parallax.factor}px ${
          5 / parallax.factor
        }px 1px rgba(0, 0, 0, 0.25)`,
        'soft-above': `0 -${5 / parallax.factor}px ${
          5 / parallax.factor
        }px 1px rgba(0, 0, 0, 0.25)`,
        'soft-before': `-${5 / parallax.factor}px 0 ${
          5 / parallax.factor
        }px 1px rgba(0, 0, 0, 0.25)`,
        'soft-after': `${5 / parallax.factor}px 0 ${
          5 / parallax.factor
        }px 1px rgba(0, 0, 0, 0.25)`,
      },
      transitionDuration: {
        turtle: '200ms',
        slow: '150ms',
        default: '100ms',
        fast: '75ms',
        hare: '50ms',
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'toast-progress': color => {
            return {
              '@keyframes toast-progress': {
                '0%': {
                  width: '100%',
                },
                '100%': {
                  width: '0%',
                },
              },
              animation: `toast-progress 5000ms linear forwards`,
              backgroundColor: color,
            };
          },
        },
        {
          values: {
            ...theme('colors'),
          },
        },
      );
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'progress-bar': (value: string) => {
            const variant = Color(value).lighten(0.4);

            return {
              '@keyframes progress-bar': {
                '0%': {
                  backgroundPosition: '0% 0%',
                },
                '100%': {
                  backgroundPosition: '100% 0%',
                },
              },
              background: `linear-gradient(${[
                'to right',
                value,
                '25%',
                variant,
                '30%',
                value,
              ].join(',')})`,
              backgroundSize: '800% 20%',
              animation:
                'progress-bar 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            };
          },
        },
        {
          values: {
            ...theme('colors'),
          },
        },
      );
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': value => ({
            textShadow: value,
          }),
        },
        {
          values: {
            ...theme('textShadow'),
          },
        },
      );
    }),
  ],
} satisfies Config;
