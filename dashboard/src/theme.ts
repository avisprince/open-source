import {
  BrandVariants,
  Theme,
  createDarkTheme,
} from '@fluentui/react-components';

const dokkimiBrand: BrandVariants = {
  '10': '#ffcfd0',
  '20': '#ffbfc1',
  '30': '#ffb0b1',
  '40': '#ffa0a1',
  '50': '#ff9092',
  '60': '#ff8082',
  '70': '#ff7073',
  '80': '#ff6063',
  '90': '#e65659',
  '100': '#cc4d4f',
  '110': '#b34345',
  '120': '#993a3b',
  '130': '#803032',
  '140': '#662628',
  '150': '#4c1d1e',
  '160': '#331314',
};

const dokkimiBrandTokens = {
  light: {
    primaryBrand: '#B80003',
    accentTextPrimary: '#920002',
    accentTextSecondary: '#680002',
    accentTextTertiary: '#B80003',
    accentDefault: 'rgba(184, 0, 3, 1);',
    accentSecondary: 'rgba(184, 0, 3, 0.9);',
    accentTertiary: 'rgba(184, 0, 3, 0.8);',
    highlightedText: '#D40004;',
  },
  dark: {
    primaryBrand: '#FF6063',
    accentTextPrimary: '#FF8587',
    accentTextSecondary: '#F7A1A3',
    accentTextTertiary: '#FF6063',
    accentDefault: 'rgba(255, 96, 99, 1);',
    accentSecondary: 'rgba(255, 96, 99, 0.9);',
    accentTertiary: 'rgba(255, 96, 99,0.8);',
    highlightedText: '#D60004;',
  },
};

export const dokkimiTheme: Theme = createDarkTheme(dokkimiBrand);
