import '@emotion/react';
import { Theme } from '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      shadow: string;
    };
    spacing: {
      '0': number;
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
      '6': number;
    };
  }
}

export const mainTheme: Theme = {
  colors: {
    primary: '#6E9E60',
    secondary: '#33bd0a',
    background: '#ab9f74ff',
    text: '#b3aea1ff',
    shadow: '#737444ff',
  },
  spacing: {
    '0': 8,
    '1': 16,
    '2': 20,
    '3': 28,
    '4': 34,
    '5': 48,
    '6': 75,
  },
};

/* SCSS HEX */
// $metallic-gold: #cfab1fff;
// $ecru: #ab9f74ff;
// $silver-chalice: #b3aea1ff;
// $umber: #5a4e42ff;
// $spanish-bistre: #737444ff;

// $gradient-top: linear-gradient(0deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-right: linear-gradient(90deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-bottom: linear-gradient(180deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-left: linear-gradient(270deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-top-right: linear-gradient(45deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-bottom-right: linear-gradient(135deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-top-left: linear-gradient(225deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-bottom-left: linear-gradient(315deg, #cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
// $gradient-radial: radial-gradient(#cfab1fff, #ab9f74ff, #b3aea1ff, #5a4e42ff, #737444ff);
