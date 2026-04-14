// Design tokens for JS consumption (chart libraries, @xyflow)
// Canonical source: app/globals.css @theme
// Keep in sync with CSS variables

export const COLORS = {
  // Status accents
  micro: '#60a5fa',
  ei: '#2dd4bf',
  eurl: '#34d399',
  sasu: '#a78bfa',
  holding: '#fbbf24',

  // Semantic (data visualization)
  negative: '#f43f5e',
  tax: '#f59e0b',
  positive: '#22c55e',

  // Accent
  accent: '#6366f1',

  // Backgrounds
  bgPrimary: '#09090b',
  bgCard: '#18181b',
  bgElevated: '#27272a',

  // Text
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',

  // Borders
  borderSubtle: '#27272a',
  borderDefault: '#3f3f46',
} as const

export type StatusColor = typeof COLORS[keyof Pick<typeof COLORS, 'micro' | 'ei' | 'eurl' | 'sasu' | 'holding'>]
