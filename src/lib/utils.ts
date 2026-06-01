import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', color: '#E1306C' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'email', label: 'Email', color: '#6B7280' },
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

// Parse platform field — handles both old single strings and new JSON arrays
export function parsePlatforms(platform: string): string[] {
  try {
    const parsed = JSON.parse(platform)
    return Array.isArray(parsed) ? parsed : [platform]
  } catch {
    return [platform]
  }
}

export function getPlatformsLabel(platform: string): string {
  return parsePlatforms(platform).map(getPlatformLabel).join(', ')
}
