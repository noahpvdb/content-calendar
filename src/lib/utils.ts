import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', color: '#E1306C' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
  { value: 'tiktok', label: 'TikTok', color: '#000000' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'twitter', label: 'X/Twitter', color: '#1DA1F2' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000' },
]

export const PILLARS = [
  { value: 'education', label: 'Education', color: '#8B5CF6' },
  { value: 'entertainment', label: 'Entertainment', color: '#F59E0B' },
  { value: 'promotion', label: 'Promotion', color: '#10B981' },
  { value: 'community', label: 'Community', color: '#3B82F6' },
  { value: 'inspiration', label: 'Inspiration', color: '#EC4899' },
]

export const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-gray-100 text-gray-700',
  draft: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  posted: 'bg-green-100 text-green-700',
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
}

export function getPlatformColor(platform: string): string {
  return PLATFORMS.find(p => p.value === platform)?.color ?? '#6B7280'
}

export function getPlatformLabel(platform: string): string {
  return PLATFORMS.find(p => p.value === platform)?.label ?? platform
}
