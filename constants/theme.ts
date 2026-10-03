export const colors = {
  background: '#0B0B0D',
  card: '#17171A',
  cardElevated: '#1F1F23',
  border: '#232328',
  cellInactive: '#29292F',
  text: '#F4F4F6',
  textMuted: '#8E8E96',
  textSubtle: '#5C5C64',
  danger: '#FF6B6B',
  primary: '#F4F4F6',
  onPrimary: '#0B0B0D',
} as const;

export const habitColors = [
  { name: 'Purple', value: '#8B7CFF' },
  { name: 'Cyan', value: '#55C7E8' },
  { name: 'Orange', value: '#E9A44C' },
  { name: 'Green', value: '#6FD08C' },
  { name: 'Pink', value: '#E982B5' },
] as const;

export const defaultHabitColor = habitColors[0].value;

export const radii = {
  card: 22,
  button: 16,
  input: 14,
  cell: 4,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Applies an alpha channel (0–1) to a #RRGGBB hex color. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
