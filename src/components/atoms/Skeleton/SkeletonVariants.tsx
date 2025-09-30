/**
 * Skeleton Variants
 * Pre-built skeleton components for common use cases
 */

import Skeleton from './Skeleton';

interface SkeletonTextProps {
  width?: string;
}

export const SkeletonText = ({ width = "w-full" }: SkeletonTextProps) => (
  <Skeleton className={`h-4 ${width}`} data-testid="skeleton-text" />
);

export const SkeletonInput = () => (
  <Skeleton className="h-10 w-full rounded-md" data-testid="skeleton-input" />
);

interface SkeletonButtonProps {
  width?: string;
}

export const SkeletonButton = ({ width = "w-24" }: SkeletonButtonProps) => (
  <Skeleton className={`h-10 ${width} rounded-md`} data-testid="skeleton-button" />
);

interface SkeletonAvatarProps {
  size?: string;
}

export const SkeletonAvatar = ({ size = "h-12 w-12" }: SkeletonAvatarProps) => (
  <Skeleton className={`${size} rounded-full`} data-testid="skeleton-avatar" />
);

interface SkeletonCardProps {
  height?: string;
}

export const SkeletonCard = ({ height = "h-32" }: SkeletonCardProps) => (
  <Skeleton className={`w-full ${height} rounded-lg`} data-testid="skeleton-card" />
);