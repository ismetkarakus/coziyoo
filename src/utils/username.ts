export type UsernameUserType = 'buyer' | 'seller' | 'both';

const TURKISH_CHAR_MAP: Record<string, string> = {
  c: 'c',
  C: 'c',
  g: 'g',
  G: 'g',
  i: 'i',
  I: 'i',
  o: 'o',
  O: 'o',
  s: 's',
  S: 's',
  u: 'u',
  U: 'u',
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

const normalizeChars = (value: string): string =>
  value
    .split('')
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join('');

const toSlug = (value: string): string => {
  const slug = normalizeChars(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'user';
};

export const getUsernamePrefix = (userType: UsernameUserType): 'buyer' | 'seller' => {
  if (userType === 'buyer') return 'buyer';
  return 'seller';
};

export const normalizeUsername = (rawValue: string, userType: UsernameUserType): string => {
  const prefix = getUsernamePrefix(userType);
  const cleaned = (rawValue || '').trim().replace(/^@+/, '');
  const withoutPrefix = cleaned.replace(/^[a-z]+_/i, '');
  const slug = toSlug(withoutPrefix || cleaned);
  return `${prefix}_${slug}`;
};

export const usernameToEditableValue = (username?: string | null): string => {
  const safeValue = (username || '').trim();
  if (!safeValue) return '';
  return safeValue.replace(/^[a-z]+_/i, '').replace(/-/g, ' ').trim();
};
