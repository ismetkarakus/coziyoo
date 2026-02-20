const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face',
];

const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face',
];

const NEUTRAL_AVATARS = [
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=240&h=240&fit=crop&crop=face',
];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const normalizeGender = (gender?: string | null): 'female' | 'male' | 'neutral' => {
  const normalized = String(gender || '').trim().toLowerCase();
  if (['female', 'woman', 'kadin', 'kadın', 'f'].includes(normalized)) return 'female';
  if (['male', 'man', 'erkek', 'm'].includes(normalized)) return 'male';
  return 'neutral';
};

export const getAvatarByGender = (gender?: string | null, key?: string): string => {
  const bucket = normalizeGender(gender);
  const source = bucket === 'female' ? FEMALE_AVATARS : bucket === 'male' ? MALE_AVATARS : NEUTRAL_AVATARS;
  const indexSeed = hashString(String(key || 'default'));
  return source[indexSeed % source.length];
};

