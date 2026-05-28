import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/styles';

export function BrandLogo({
  href,
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  const content = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/task-room-logo.png"
        alt="TaskRoom"
        width={220}
        height={64}
        priority
        className={compact ? 'h-16 w-auto' : 'h-12 w-auto'}
      />
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="TaskRoom home" className="inline-flex">
      {content}
    </Link>
  );
}
