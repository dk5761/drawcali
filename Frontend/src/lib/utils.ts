import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Open Color utility functions for theme integration
export const openColors = {
  gray: {
    0: "var(--oc-gray-0)",
    1: "var(--oc-gray-1)",
    2: "var(--oc-gray-2)",
    3: "var(--oc-gray-3)",
    4: "var(--oc-gray-4)",
    5: "var(--oc-gray-5)",
    6: "var(--oc-gray-6)",
    7: "var(--oc-gray-7)",
    8: "var(--oc-gray-8)",
    9: "var(--oc-gray-9)",
  },
  red: {
    0: "var(--oc-red-0)",
    1: "var(--oc-red-1)",
    2: "var(--oc-red-2)",
    3: "var(--oc-red-3)",
    4: "var(--oc-red-4)",
    5: "var(--oc-red-5)",
    6: "var(--oc-red-6)",
    7: "var(--oc-red-7)",
    8: "var(--oc-red-8)",
    9: "var(--oc-red-9)",
  },
  orange: {
    0: "var(--oc-orange-0)",
    1: "var(--oc-orange-1)",
    2: "var(--oc-orange-2)",
    3: "var(--oc-orange-3)",
    4: "var(--oc-orange-4)",
    5: "var(--oc-orange-5)",
    6: "var(--oc-orange-6)",
    7: "var(--oc-orange-7)",
    8: "var(--oc-orange-8)",
    9: "var(--oc-orange-9)",
  },
  yellow: {
    0: "var(--oc-yellow-0)",
    1: "var(--oc-yellow-1)",
    2: "var(--oc-yellow-2)",
    3: "var(--oc-yellow-3)",
    4: "var(--oc-yellow-4)",
    5: "var(--oc-yellow-5)",
    6: "var(--oc-yellow-6)",
    7: "var(--oc-yellow-7)",
    8: "var(--oc-yellow-8)",
    9: "var(--oc-yellow-9)",
  },
  green: {
    0: "var(--oc-green-0)",
    1: "var(--oc-green-1)",
    2: "var(--oc-green-2)",
    3: "var(--oc-green-3)",
    4: "var(--oc-green-4)",
    5: "var(--oc-green-5)",
    6: "var(--oc-green-6)",
    7: "var(--oc-green-7)",
    8: "var(--oc-green-8)",
    9: "var(--oc-green-9)",
  },
  blue: {
    0: "var(--oc-blue-0)",
    1: "var(--oc-blue-1)",
    2: "var(--oc-blue-2)",
    3: "var(--oc-blue-3)",
    4: "var(--oc-blue-4)",
    5: "var(--oc-blue-5)",
    6: "var(--oc-blue-6)",
    7: "var(--oc-blue-7)",
    8: "var(--oc-blue-8)",
    9: "var(--oc-blue-9)",
  },
  indigo: {
    0: "var(--oc-indigo-0)",
    1: "var(--oc-indigo-1)",
    2: "var(--oc-indigo-2)",
    3: "var(--oc-indigo-3)",
    4: "var(--oc-indigo-4)",
    5: "var(--oc-indigo-5)",
    6: "var(--oc-indigo-6)",
    7: "var(--oc-indigo-7)",
    8: "var(--oc-indigo-8)",
    9: "var(--oc-indigo-9)",
  },
  violet: {
    0: "var(--oc-violet-0)",
    1: "var(--oc-violet-1)",
    2: "var(--oc-violet-2)",
    3: "var(--oc-violet-3)",
    4: "var(--oc-violet-4)",
    5: "var(--oc-violet-5)",
    6: "var(--oc-violet-6)",
    7: "var(--oc-violet-7)",
    8: "var(--oc-violet-8)",
    9: "var(--oc-violet-9)",
  },
};

// Create a custom color palette for Excalidraw using open-color
export const createExcalidrawColorPalette = (isDark: boolean) => {
  const baseColors = [
    openColors.gray[isDark ? 2 : 8],
    openColors.red[isDark ? 4 : 6],
    openColors.orange[isDark ? 4 : 6],
    openColors.yellow[isDark ? 4 : 6],
    openColors.green[isDark ? 4 : 6],
    openColors.blue[isDark ? 4 : 6],
    openColors.indigo[isDark ? 4 : 6],
    openColors.violet[isDark ? 4 : 6],
  ];

  return {
    canvasBackground: isDark ? openColors.gray[9] : openColors.gray[0],
    elementBackground: isDark ? openColors.gray[8] : openColors.gray[1],
    elementStroke: isDark ? openColors.gray[2] : openColors.gray[8],
    appBackground: isDark ? openColors.gray[9] : openColors.gray[0],
    palette: baseColors,
  };
};

// Get theme-appropriate colors
export const getThemeColors = (isDark: boolean) => ({
  primary: isDark ? openColors.blue[4] : openColors.blue[6],
  secondary: isDark ? openColors.gray[6] : openColors.gray[2],
  accent: isDark ? openColors.violet[4] : openColors.violet[6],
  success: isDark ? openColors.green[4] : openColors.green[6],
  warning: isDark ? openColors.orange[4] : openColors.orange[6],
  danger: isDark ? openColors.red[4] : openColors.red[6],
  text: isDark ? openColors.gray[0] : openColors.gray[9],
  textSecondary: isDark ? openColors.gray[3] : openColors.gray[7],
  background: isDark ? openColors.gray[9] : openColors.gray[0],
  surface: isDark ? openColors.gray[8] : openColors.gray[1],
  border: isDark ? openColors.gray[7] : openColors.gray[3],
});
