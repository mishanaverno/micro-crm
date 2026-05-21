import { cn } from '@/lib/utils';

const avatarPalettes = [
  'bg-rose-100 text-rose-800 ring-rose-200',
  'bg-orange-100 text-orange-800 ring-orange-200',
  'bg-amber-100 text-amber-800 ring-amber-200',
  'bg-lime-100 text-lime-800 ring-lime-200',
  'bg-emerald-100 text-emerald-800 ring-emerald-200',
  'bg-cyan-100 text-cyan-800 ring-cyan-200',
  'bg-sky-100 text-sky-800 ring-sky-200',
  'bg-indigo-100 text-indigo-800 ring-indigo-200',
  'bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200',
  'bg-stone-200 text-stone-800 ring-stone-300',
];

type ClientAvatarProps = {
  className?: string;
  name?: string | null;
};

function getInitials(name?: string | null) {
  const parts = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('ru-RU');
}

function getNameHash(name?: string | null) {
  return Array.from((name ?? '').trim().toLocaleLowerCase('ru-RU')).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    7,
  );
}

export function ClientAvatar({ className, name }: ClientAvatarProps) {
  const palette = avatarPalettes[getNameHash(name) % avatarPalettes.length];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1',
        palette,
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
