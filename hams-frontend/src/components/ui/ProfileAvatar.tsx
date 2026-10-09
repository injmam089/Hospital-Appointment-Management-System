import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export type AvatarRole = 'patient' | 'doctor' | 'neutral';
export type AvatarAgeGroup = 'child' | 'young-adult' | 'adult' | 'senior';
export type AvatarGender = 'MALE' | 'FEMALE' | 'OTHER' | 'male' | 'female' | 'other';
export type AvatarSize = 'compact' | 'sm' | 'md' | 'medium' | 'lg' | 'large' | 'xl' | '2xl';

export interface ProfileAvatarProps {
  role?: AvatarRole;
  ageGroup?: AvatarAgeGroup;
  gender?: AvatarGender;
  name?: string;
  size?: AvatarSize;
  animated?: boolean;
  className?: string;
  showBadge?: boolean;
  image?: string;
  onClick?: () => void;
}

const sizeConfig: Record<string, { container: string; px: number }> = {
  compact: { container: 'w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px]', px: 40 },
  sm:      { container: 'w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px]',   px: 36 },
  md:      { container: 'w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px]', px: 56 },
  medium:  { container: 'w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px]', px: 56 },
  lg:      { container: 'w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px]', px: 64 },
  large:   { container: 'w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px]', px: 64 },
  '2xl':   { container: 'w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px]', px: 80 },
  xl:      { container: 'w-24 h-24 min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px]', px: 96 },
};

export function ProfileAvatar({
  role = 'neutral',
  ageGroup = 'adult',
  gender,
  name,
  size = 'md',
  animated = true,
  className,
  showBadge = false,
  image,
  onClick,
}: ProfileAvatarProps) {
  const uniqueId = useId().replace(/:/g, '_');
  const prefersReduced = useReducedMotion();

  // Normalize inputs safely without guessing
  const normalizedGender = gender ? gender.toUpperCase() : undefined;
  const cfg = sizeConfig[size] || sizeConfig.md;

  // Accessible label
  const accessibleLabel = name
    ? `${name} (${role}) avatar`
    : `${role.charAt(0).toUpperCase() + role.slice(1)} avatar`;

  // Palette definitions tailored to role and theme
  const getThemePalette = () => {
    switch (role) {
      case 'doctor':
        return {
          bgGradStart: '#0d9488', // teal-600
          bgGradEnd:   '#0284c7', // sky-600
          bgLight1:    '#f0fdfa', // teal-50
          bgLight2:    '#e0f2fe', // sky-100
          ringColor:   'ring-teal-500/30 dark:ring-teal-400/30',
          clothPrimary: '#ffffff', // Lab coat
          clothShadow:  '#e2e8f0', // slate-200
          scrubColor:   '#0284c7', // sky-600 inner scrub
          stethColor:   '#0f172a', // dark stethoscope tube
          stethDisc:    '#38bdf8', // cyan stethoscope disc
          badgeBg:      'bg-teal-500',
        };
      case 'patient':
        return {
          bgGradStart: '#2563eb', // blue-600
          bgGradEnd:   '#06b6d4', // cyan-500
          bgLight1:    '#eff6ff', // blue-50
          bgLight2:    '#cffafe', // cyan-100
          ringColor:   'ring-blue-500/30 dark:ring-sky-400/30',
          clothPrimary: '#2563eb', // Healthcare blue polo/crew
          clothShadow:  '#1d4ed8', // blue-700
          scrubColor:   '#38bdf8', // cyan accent
          stethColor:   '#2563eb',
          stethDisc:    '#38bdf8',
          badgeBg:      'bg-blue-500',
        };
      default: // neutral
        return {
          bgGradStart: '#4f46e5', // indigo-600
          bgGradEnd:   '#0284c7', // sky-600
          bgLight1:    '#f8fafc', // slate-50
          bgLight2:    '#e2e8f0', // slate-200
          ringColor:   'ring-indigo-500/20 dark:ring-indigo-400/20',
          clothPrimary: '#334155', // slate-700
          clothShadow:  '#1e293b',
          scrubColor:   '#64748b',
          stethColor:   '#475569',
          stethDisc:    '#94a3b8',
          badgeBg:      'bg-indigo-500',
        };
    }
  };

  const palette = getThemePalette();

  // Skin and Hair palette
  const skinColor = '#fed7aa'; // warm neutral skin tone (tone 1)
  const skinShadow = '#fdba74';
  const blushColor = '#f43f5e';
  const eyeColor = '#0f172a';
  const smileColor = '#9a3412';

  // Hair styling based on explicitly provided age/gender
  const hairColor = ageGroup === 'senior' ? '#94a3b8' : '#1e293b';

  // Render stylized hair vector geometry
  const renderHair = () => {
    if (normalizedGender === 'FEMALE') {
      return (
        <g id="female-hair">
          {/* Hair volume framing face */}
          <path
            d="M28 42 C26 24, 38 12, 50 12 C62 12, 74 24, 72 42 C70 48, 67 46, 68 38 C68 28, 62 20, 50 20 C38 20, 32 28, 32 38 C33 46, 30 48, 28 42 Z"
            fill={hairColor}
          />
          {/* Side swept front bangs */}
          <path
            d="M32 26 C40 18, 54 18, 66 25 C60 22, 48 22, 36 28 Z"
            fill={hairColor}
            opacity="0.9"
          />
        </g>
      );
    }

    if (normalizedGender === 'MALE') {
      return (
        <g id="male-hair">
          {/* Modern structured taper haircut */}
          <path
            d="M29 34 C29 20, 39 13, 50 13 C61 13, 71 20, 71 34 C67 24, 59 19, 49 19 C39 19, 32 24, 29 34 Z"
            fill={hairColor}
          />
          {/* Subtle side texture */}
          <path
            d="M31 32 C30 25, 34 20, 42 16 C35 19, 32 24, 31 32 Z"
            fill={hairColor}
            opacity="0.85"
          />
        </g>
      );
    }

    // Neutral / Default Professional Haircut (Works elegantly for all identities)
    return (
      <g id="neutral-hair">
        <path
          d="M29 36 C29 21, 39 13, 50 13 C61 13, 71 21, 71 36 C67 25, 59 19, 49 19 C39 19, 33 25, 29 36 Z"
          fill={hairColor}
        />
        <path
          d="M34 22 C42 16, 56 16, 64 22 C58 19, 44 19, 34 22 Z"
          fill={hairColor}
          opacity="0.9"
        />
      </g>
    );
  };

  // Render Role-Specific Clothing (Lab coat + Stethoscope for doctor, polished polo for patient)
  const renderClothing = () => {
    if (role === 'doctor') {
      return (
        <g id="doctor-attire">
          {/* Inner Medical Scrub Shirt */}
          <path
            d="M36 67 L50 80 L64 67 L64 100 L36 100 Z"
            fill={palette.scrubColor}
          />
          {/* Scrub V-neck line */}
          <path
            d="M42 67 L50 75 L58 67"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
          />

          {/* Crisp White Lab Coat - Left Panel */}
          <path
            d="M18 74 C22 66, 32 65, 38 67 L48 83 L38 100 L14 100 C15 90, 16 80, 18 74 Z"
            fill={palette.clothPrimary}
            stroke={palette.clothShadow}
            strokeWidth="0.8"
          />
          {/* Lab Coat - Right Panel */}
          <path
            d="M82 74 C78 66, 68 65, 62 67 L52 83 L62 100 L86 100 C85 90, 84 80, 82 74 Z"
            fill={palette.clothPrimary}
            stroke={palette.clothShadow}
            strokeWidth="0.8"
          />

          {/* Stethoscope around neck */}
          <path
            d="M38 68 C35 78, 40 88, 47 88 C49 88, 51 86, 51 83 L51 81"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Stethoscope chestpiece */}
          <circle cx="51" cy="80" r="3.6" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
          <circle cx="51" cy="80" r="1.5" fill="#38bdf8" />
        </g>
      );
    }

    if (role === 'patient') {
      return (
        <g id="patient-attire">
          {/* Patient Clean Healthcare Polo / Casual Top */}
          <path
            d="M20 76 C24 65, 36 63, 50 63 C64 63, 76 65, 80 76 L86 100 L14 100 Z"
            fill={palette.clothPrimary}
          />
          {/* Polo Collar Detail */}
          <path
            d="M40 63 L50 74 L60 63"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Subtle Button placket */}
          <line x1="50" y1="74" x2="50" y2="86" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="50" cy="79" r="1" fill="#ffffff" />
        </g>
      );
    }

    // Neutral Attire
    return (
      <g id="neutral-attire">
        <path
          d="M20 76 C24 65, 36 63, 50 63 C64 63, 76 65, 80 76 L86 100 L14 100 Z"
          fill={palette.clothPrimary}
        />
        <path
          d="M42 63 C42 71, 58 71, 58 63 Z"
          fill={palette.scrubColor}
          opacity="0.8"
        />
      </g>
    );
  };

  // Motion variants
  const shouldAnimate = animated && !prefersReduced;

  return (
    <motion.div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full select-none flex-shrink-0 overflow-hidden',
        cfg.container,
        'ring-2 shadow-xs transition-shadow',
        palette.ringColor,
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      initial={shouldAnimate ? { scale: 0.94, opacity: 0 } : false}
      animate={shouldAnimate ? { scale: 1, opacity: 1 } : false}
      whileHover={shouldAnimate && onClick ? { scale: 1.05 } : undefined}
      whileTap={shouldAnimate && onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      role="img"
      aria-label={accessibleLabel}
    >
      {image ? (
        <img
          src={image}
          alt={accessibleLabel}
          className="w-full h-full object-cover rounded-full"
          loading="eager"
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full rounded-full overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          {/* Background Radial Gradient */}
          <radialGradient
            id={`bg_${uniqueId}`}
            cx="50%"
            cy="35%"
            r="65%"
          >
            <stop offset="0%" stopColor={palette.bgLight2} stopOpacity="1" />
            <stop offset="100%" stopColor={palette.bgLight1} stopOpacity="1" />
          </radialGradient>

          {/* Dark Mode Overlay Gradient */}
          <linearGradient
            id={`dark_bg_${uniqueId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.bgGradStart} stopOpacity="0.25" />
            <stop offset="100%" stopColor={palette.bgGradEnd} stopOpacity="0.35" />
          </linearGradient>

          {/* Clip path for circular avatar boundary */}
          <clipPath id={`clip_${uniqueId}`}>
            <circle cx="50" cy="50" r="49" />
          </clipPath>
        </defs>

        <g clipPath={`url(#clip_${uniqueId})`}>
          {/* 1. Backdrop */}
          <rect width="100" height="100" fill={`url(#bg_${uniqueId})`} />
          <rect
            width="100"
            height="100"
            fill={`url(#dark_bg_${uniqueId})`}
            className="hidden dark:block"
          />

          {/* Subtle Decorative Ambient Ring / Cross in background */}
          <circle
            cx="50"
            cy="35"
            r="28"
            fill="none"
            stroke={palette.bgGradEnd}
            strokeWidth="0.8"
            opacity="0.25"
            strokeDasharray="3 3"
          />

          {/* 2. Neck & Neck Shadow */}
          <rect x="44" y="50" width="12" height="18" rx="4" fill={skinColor} />
          <path
            d="M44 54 C48 58, 52 58, 56 54 L56 58 C52 61, 48 61, 44 58 Z"
            fill={skinShadow}
            opacity="0.8"
          />

          {/* 3. Clothing Layer */}
          {renderClothing()}

          {/* 4. Head & Face */}
          <g id="head">
            {/* Ears */}
            <circle cx="31.5" cy="40" r="4.2" fill={skinColor} />
            <circle cx="31.5" cy="40" r="2.2" fill={skinShadow} opacity="0.6" />
            <circle cx="68.5" cy="40" r="4.2" fill={skinColor} />
            <circle cx="68.5" cy="40" r="2.2" fill={skinShadow} opacity="0.6" />

            {/* Face Oval */}
            <rect
              x="33"
              y="22"
              width="34"
              height="38"
              rx="17"
              fill={skinColor}
            />

            {/* Soft Cheek Blush */}
            <ellipse cx="38" cy="45" rx="3.2" ry="1.8" fill={blushColor} opacity="0.45" />
            <ellipse cx="62" cy="45" rx="3.2" ry="1.8" fill={blushColor} opacity="0.45" />

            {/* Eyes */}
            <ellipse cx="41.5" cy="38" rx="2" ry="2.6" fill={eyeColor} />
            <ellipse cx="58.5" cy="38" rx="2" ry="2.6" fill={eyeColor} />
            {/* Eye Catchlights */}
            <circle cx="41" cy="37.2" r="0.8" fill="#ffffff" />
            <circle cx="58" cy="37.2" r="0.8" fill="#ffffff" />

            {/* Approachable Eyebrows */}
            <path
              d="M38 33 Q41.5 31.5 44.5 32.8"
              fill="none"
              stroke={hairColor}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M55.5 32.8 Q58.5 31.5 62 33"
              fill="none"
              stroke={hairColor}
              strokeWidth="1.4"
              strokeLinecap="round"
            />

            {/* Gentle Smile */}
            <path
              d="M45 47 Q50 51.5 55 47"
              fill="none"
              stroke={smileColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>

          {/* 5. Hair Layer */}
          {renderHair()}
        </g>
      </svg>
      )}

      {/* Decorative Role/Status Badge on corner */}
      {showBadge && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
            palette.badgeBg
          )}
          title={`${role} active`}
        />
      )}
    </motion.div>
  );
}
