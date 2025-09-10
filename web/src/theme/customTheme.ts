import { createLightTheme, createDarkTheme } from '@fluentui/react-components';
import type { BrandVariants } from '@fluentui/react-components';

// 自定义品牌色彩 - 选择温暖的蓝色调
const brandColors: BrandVariants = {
  10: '#020305',
  20: '#111723',
  30: '#16263D',
  40: '#193253',
  50: '#1B3F6A',
  60: '#1C4C82',
  70: '#1C5A9B',
  80: '#1A68B4',
  90: '#1577CD',
  100: '#0D87E6',
  110: '#3A96E8',
  120: '#5AA5EA',
  130: '#74B4EC',
  140: '#8BC3EE',
  150: '#A1D2F0',
  160: '#B6E1F2',
};

// 创建浅色主题
export const notebookLightTheme = createLightTheme(brandColors);

// 创建深色主题
export const notebookDarkTheme = createDarkTheme(brandColors);

// 主题类型
export type ThemeType = 'light' | 'dark';

// 主题选择器
export const getTheme = (themeType: ThemeType) => {
  return themeType === 'dark' ? notebookDarkTheme : notebookLightTheme;
};