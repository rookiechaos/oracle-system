export const C = {
  bg:            '#050010',
  bgCard:        '#0b0022',
  bgCardAlt:     '#0f0030',
  cyan:          '#00e5ff',
  cyanDim:       'rgba(0,229,255,0.12)',
  cyanBorder:    'rgba(0,229,255,0.3)',
  magenta:       '#ff00dd',
  magentaDim:    'rgba(255,0,221,0.12)',
  magentaBorder: 'rgba(255,0,221,0.3)',
  green:         '#00ff88',
  greenDim:      'rgba(0,255,136,0.12)',
  greenBorder:   'rgba(0,255,136,0.3)',
  yellow:        '#ffe500',
  yellowBorder:  'rgba(255,229,0,0.3)',
  red:           '#ff0055',
  text:          '#cce0ff',
  textDim:       '#3a4870',
  textMuted:     '#252a50',
  border:        '#180040',
  borderBright:  '#2d0065',
} as const;

export const neonBox = (color: string, px = 12) =>
  `0 0 ${px}px ${color}, 0 0 ${px * 2}px ${color}40`;
