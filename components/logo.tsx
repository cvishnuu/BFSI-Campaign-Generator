import Image from 'next/image';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/ndw-logo.svg"
      alt="Newgen Digital Works"
      width={120}
      height={40}
      className={className}
      style={{ width: 'auto', height: '40px' }}
    />
  );
}
