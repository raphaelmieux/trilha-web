import { Footprints, Layers, Flame, Trophy, Star, Award, type LucideIcon } from 'lucide-react';
import type { Badge } from '../../types';

const ICONS: Record<string, LucideIcon> = {
  footprints: Footprints,
  layers: Layers,
  flame: Flame,
  trophy: Trophy,
  star: Star,
  award: Award,
};

const TIER_COLORS: Record<Badge['tier'], string> = {
  bronze: '#c17f45',
  silver: '#b0b0b4',
  gold: 'var(--color-secondary)',
};

export default function BadgeIcon({ badge, size = 'md' }: { badge: Badge; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = ICONS[badge.icon] || Award;
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  const color = TIER_COLORS[badge.tier];
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: `${color}22`, border: `1px solid ${color}55` }}
      title={badge.name}
    >
      <Icon className={iconSize} style={{ color }} />
    </div>
  );
}
