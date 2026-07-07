import React from 'react';

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export function GlitchText({ text, className = '', style }: Props) {
  return (
    <span
      className={`glitch ${className}`}
      data-text={text}
      style={style}
    >
      {text}
    </span>
  );
}
