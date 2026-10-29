import { useState } from 'react';

export type IconlyAnimationName =
  | 'dollar-up'
  | 'users-ai'
  | 'party'
  | 'heart'
  | 'star-medal'
  | 'repeat'
  | 'receipt-check'
  | 'clap';

interface IconlyAnimationProps {
  name: IconlyAnimationName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

const ANIMATION_PATHS: Record<IconlyAnimationName, string> = {
  'dollar-up': '/animations/iconly/dollar-up.gif',
  'users-ai': '/animations/iconly/users-ai.gif',
  party: '/animations/iconly/party.gif',
  heart: '/animations/iconly/heart.gif',
  'star-medal': '/animations/iconly/star-medal.gif',
  repeat: '/animations/iconly/repeat.gif',
  'receipt-check': '/animations/iconly/receipt-check.gif',
  clap: '/animations/iconly/clap.gif',
};

const ALT_DESCRIPTIONS: Record<IconlyAnimationName, string> = {
  'dollar-up': 'Budget growth animation',
  'users-ai': 'AI Event intelligence animation',
  party: 'Celebration party popper animation',
  heart: 'Romantic celebration heart animation',
  'star-medal': 'Award and quality milestone animation',
  repeat: 'Refresh and reset animation',
  'receipt-check': 'Receipt and invoice verified animation',
  clap: 'Applause celebration animation',
};

export function IconlyAnimation({
  name,
  size = 24,
  className = '',
  style = {},
  alt,
}: IconlyAnimationProps) {
  const [hasError, setHasError] = useState(false);
  const src = ANIMATION_PATHS[name];
  const altText = alt || ALT_DESCRIPTIONS[name];

  if (hasError || !src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={altText}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`iconly-animation ${className}`.trim()}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: '4px',
        userSelect: 'none',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))',
        ...style,
      }}
    />
  );
}

export default IconlyAnimation;

