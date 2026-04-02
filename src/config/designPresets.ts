export interface DesignPreset {
  id: string;
  name: string;
  description: string;
  preview: { bg: string; accent: string; surface: string };
  /** Visual style beyond color */
  style: {
    radius: string;        // border-radius for cards/panels: 'sharp' | 'rounded' | 'pill'
    sidebarStyle: string;  // 'solid' | 'glass' | 'bordered'
    fontWeight: string;    // 'normal' | 'medium' | 'bold'
    cardBorder: boolean;   // whether cards show borders
    glowAccent: boolean;   // subtle glow on active/hover elements
  };
  colors: {
    primary: string;
    'primary-light': string;
    'primary-dark': string;
    surface: string;
    'surface-light': string;
    'surface-lighter': string;
    border: string;
    text: string;
    'text-muted': string;
    'page-bg': string;
    'sidebar-bg': string;
    'sidebar-border': string;
    'accent-glow': string;
  };
  light: {
    surface: string;
    'surface-light': string;
    'surface-lighter': string;
    border: string;
    text: string;
    'text-muted': string;
    'page-bg': string;
    'sidebar-bg': string;
    'sidebar-border': string;
    'accent-glow': string;
  };
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep indigo — the default',
    preview: { bg: '#111119', accent: '#6366f1', surface: '#1e1e2e' },
    style: {
      radius: 'rounded',
      sidebarStyle: 'solid',
      fontWeight: 'normal',
      cardBorder: true,
      glowAccent: false,
    },
    colors: {
      primary: '#6366f1',
      'primary-light': '#818cf8',
      'primary-dark': '#4f46e5',
      surface: '#1e1e2e',
      'surface-light': '#2a2a3e',
      'surface-lighter': '#363650',
      border: '#3f3f5f',
      text: '#e2e8f0',
      'text-muted': '#94a3b8',
      'page-bg': '#111119',
      'sidebar-bg': '#1e1e2e',
      'sidebar-border': '#3f3f5f',
      'accent-glow': 'transparent',
    },
    light: {
      surface: '#ffffff',
      'surface-light': '#f8fafc',
      'surface-lighter': '#f1f5f9',
      border: '#e2e8f0',
      text: '#1e293b',
      'text-muted': '#64748b',
      'page-bg': '#f1f5f9',
      'sidebar-bg': '#ffffff',
      'sidebar-border': '#e2e8f0',
      'accent-glow': 'transparent',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Terminal hacker vibes',
    preview: { bg: '#080f0c', accent: '#10b981', surface: '#0f1d17' },
    style: {
      radius: 'sharp',
      sidebarStyle: 'bordered',
      fontWeight: 'medium',
      cardBorder: true,
      glowAccent: true,
    },
    colors: {
      primary: '#10b981',
      'primary-light': '#34d399',
      'primary-dark': '#059669',
      surface: '#0f1d17',
      'surface-light': '#162920',
      'surface-lighter': '#1f362b',
      border: '#1a4032',
      text: '#d1fae5',
      'text-muted': '#6ee7b7',
      'page-bg': '#080f0c',
      'sidebar-bg': '#0a1410',
      'sidebar-border': '#10b981',
      'accent-glow': '#10b98120',
    },
    light: {
      surface: '#f0fdf7',
      'surface-light': '#ecfdf5',
      'surface-lighter': '#d1fae5',
      border: '#a7f3d0',
      text: '#064e3b',
      'text-muted': '#047857',
      'page-bg': '#f0fdf4',
      'sidebar-bg': '#ecfdf5',
      'sidebar-border': '#34d399',
      'accent-glow': '#10b98115',
    },
  },
  {
    id: 'rose',
    name: 'Rosé',
    description: 'Elegant warm pink',
    preview: { bg: '#120a0e', accent: '#f43f5e', surface: '#1f1318' },
    style: {
      radius: 'pill',
      sidebarStyle: 'glass',
      fontWeight: 'normal',
      cardBorder: true,
      glowAccent: true,
    },
    colors: {
      primary: '#f43f5e',
      'primary-light': '#fb7185',
      'primary-dark': '#e11d48',
      surface: '#1f1318',
      'surface-light': '#2c1b22',
      'surface-lighter': '#3d252f',
      border: '#4d2d3a',
      text: '#fce7f3',
      'text-muted': '#f9a8d4',
      'page-bg': '#120a0e',
      'sidebar-bg': '#1a0f14',
      'sidebar-border': '#4d2d3a',
      'accent-glow': '#f43f5e18',
    },
    light: {
      surface: '#ffffff',
      'surface-light': '#fff1f2',
      'surface-lighter': '#ffe4e6',
      border: '#fecdd3',
      text: '#4c0519',
      'text-muted': '#be123c',
      'page-bg': '#fff5f6',
      'sidebar-bg': '#ffffff',
      'sidebar-border': '#fecdd3',
      'accent-glow': '#f43f5e10',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue depths',
    preview: { bg: '#060c18', accent: '#3b82f6', surface: '#0c1525' },
    style: {
      radius: 'rounded',
      sidebarStyle: 'solid',
      fontWeight: 'normal',
      cardBorder: true,
      glowAccent: false,
    },
    colors: {
      primary: '#3b82f6',
      'primary-light': '#60a5fa',
      'primary-dark': '#2563eb',
      surface: '#0c1525',
      'surface-light': '#131e33',
      'surface-lighter': '#1b2943',
      border: '#1e3a5f',
      text: '#dbeafe',
      'text-muted': '#93c5fd',
      'page-bg': '#060c18',
      'sidebar-bg': '#0c1525',
      'sidebar-border': '#1e3a5f',
      'accent-glow': 'transparent',
    },
    light: {
      surface: '#ffffff',
      'surface-light': '#eff6ff',
      'surface-lighter': '#dbeafe',
      border: '#bfdbfe',
      text: '#1e3a5f',
      'text-muted': '#2563eb',
      'page-bg': '#f0f6ff',
      'sidebar-bg': '#ffffff',
      'sidebar-border': '#bfdbfe',
      'accent-glow': 'transparent',
    },
  },
  {
    id: 'amber',
    name: 'Amber',
    description: 'Warm golden tones',
    preview: { bg: '#110e06', accent: '#f59e0b', surface: '#1e190c' },
    style: {
      radius: 'rounded',
      sidebarStyle: 'solid',
      fontWeight: 'medium',
      cardBorder: true,
      glowAccent: false,
    },
    colors: {
      primary: '#f59e0b',
      'primary-light': '#fbbf24',
      'primary-dark': '#d97706',
      surface: '#1e190c',
      'surface-light': '#2b2412',
      'surface-lighter': '#3a311a',
      border: '#4d4022',
      text: '#fef3c7',
      'text-muted': '#fcd34d',
      'page-bg': '#110e06',
      'sidebar-bg': '#1e190c',
      'sidebar-border': '#4d4022',
      'accent-glow': 'transparent',
    },
    light: {
      surface: '#ffffff',
      'surface-light': '#fffbeb',
      'surface-lighter': '#fef3c7',
      border: '#fde68a',
      text: '#451a03',
      'text-muted': '#b45309',
      'page-bg': '#fffcf0',
      'sidebar-bg': '#ffffff',
      'sidebar-border': '#fde68a',
      'accent-glow': 'transparent',
    },
  },
  {
    id: 'slate',
    name: 'Monochrome',
    description: 'Minimal neutral gray',
    preview: { bg: '#0c0c0f', accent: '#a1a1aa', surface: '#161619' },
    style: {
      radius: 'sharp',
      sidebarStyle: 'bordered',
      fontWeight: 'bold',
      cardBorder: false,
      glowAccent: false,
    },
    colors: {
      primary: '#a1a1aa',
      'primary-light': '#d4d4d8',
      'primary-dark': '#71717a',
      surface: '#161619',
      'surface-light': '#1e1e22',
      'surface-lighter': '#28282e',
      border: '#3f3f46',
      text: '#e4e4e7',
      'text-muted': '#a1a1aa',
      'page-bg': '#0c0c0f',
      'sidebar-bg': '#111114',
      'sidebar-border': '#3f3f46',
      'accent-glow': 'transparent',
    },
    light: {
      surface: '#ffffff',
      'surface-light': '#fafafa',
      'surface-lighter': '#f4f4f5',
      border: '#d4d4d8',
      text: '#18181b',
      'text-muted': '#71717a',
      'page-bg': '#f8f8fa',
      'sidebar-bg': '#ffffff',
      'sidebar-border': '#d4d4d8',
      'accent-glow': 'transparent',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon pink + cyan glow',
    preview: { bg: '#0a0a12', accent: '#ff2e97', surface: '#12111e' },
    style: {
      radius: 'sharp',
      sidebarStyle: 'glass',
      fontWeight: 'bold',
      cardBorder: true,
      glowAccent: true,
    },
    colors: {
      primary: '#ff2e97',
      'primary-light': '#ff6eb4',
      'primary-dark': '#d91a78',
      surface: '#12111e',
      'surface-light': '#1a182b',
      'surface-lighter': '#242238',
      border: '#3b2d5c',
      text: '#f0e6ff',
      'text-muted': '#c4b5fd',
      'page-bg': '#0a0a12',
      'sidebar-bg': '#0d0c18',
      'sidebar-border': '#ff2e9740',
      'accent-glow': '#ff2e9725',
    },
    light: {
      surface: '#fdf4ff',
      'surface-light': '#fae8ff',
      'surface-lighter': '#f3e8ff',
      border: '#e9d5ff',
      text: '#3b0764',
      'text-muted': '#a21caf',
      'page-bg': '#fef7ff',
      'sidebar-bg': '#fdf4ff',
      'sidebar-border': '#e879f9',
      'accent-glow': '#ff2e9712',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Soft arctic pastels',
    preview: { bg: '#2e3440', accent: '#88c0d0', surface: '#3b4252' },
    style: {
      radius: 'pill',
      sidebarStyle: 'solid',
      fontWeight: 'normal',
      cardBorder: false,
      glowAccent: false,
    },
    colors: {
      primary: '#88c0d0',
      'primary-light': '#8fbcbb',
      'primary-dark': '#5e81ac',
      surface: '#3b4252',
      'surface-light': '#434c5e',
      'surface-lighter': '#4c566a',
      border: '#4c566a',
      text: '#eceff4',
      'text-muted': '#d8dee9',
      'page-bg': '#2e3440',
      'sidebar-bg': '#2e3440',
      'sidebar-border': '#4c566a',
      'accent-glow': 'transparent',
    },
    light: {
      surface: '#eceff4',
      'surface-light': '#e5e9f0',
      'surface-lighter': '#d8dee9',
      border: '#c8cdd6',
      text: '#2e3440',
      'text-muted': '#4c566a',
      'page-bg': '#f2f4f8',
      'sidebar-bg': '#eceff4',
      'sidebar-border': '#d8dee9',
      'accent-glow': 'transparent',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Classic dark purple',
    preview: { bg: '#21222c', accent: '#bd93f9', surface: '#282a36' },
    style: {
      radius: 'rounded',
      sidebarStyle: 'solid',
      fontWeight: 'normal',
      cardBorder: true,
      glowAccent: true,
    },
    colors: {
      primary: '#bd93f9',
      'primary-light': '#caa9fa',
      'primary-dark': '#9a6fdc',
      surface: '#282a36',
      'surface-light': '#323442',
      'surface-lighter': '#3c3f50',
      border: '#44475a',
      text: '#f8f8f2',
      'text-muted': '#6272a4',
      'page-bg': '#21222c',
      'sidebar-bg': '#282a36',
      'sidebar-border': '#44475a',
      'accent-glow': '#bd93f918',
    },
    light: {
      surface: '#ffffff',
      'surface-light': '#f8f8f2',
      'surface-lighter': '#f0f0ec',
      border: '#d6d6d0',
      text: '#282a36',
      'text-muted': '#6272a4',
      'page-bg': '#f8f8f4',
      'sidebar-bg': '#ffffff',
      'sidebar-border': '#d6d6d0',
      'accent-glow': '#bd93f910',
    },
  },
];

export function getPreset(id: string): DesignPreset {
  return DESIGN_PRESETS.find((p) => p.id === id) ?? DESIGN_PRESETS[0];
}
