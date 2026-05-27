'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/styles';

interface NavLink {
  href: string;
  label: string;
}

interface PortalNavProps {
  isAdmin: boolean;
}

export function PortalNav({ isAdmin }: PortalNavProps) {
  const pathname = usePathname();

  const links: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    ...(isAdmin
      ? [
          { href: '/users', label: 'Users' },
          { href: '/tasks', label: 'Tasks' },
          { href: '/payments', label: 'Payments' },
        ]
      : [
          { href: '/tasks', label: 'Tasks' },
          { href: '/earnings', label: 'Earnings' },
        ]),
  ];

  const activePath = pathname || '';
  const isActive = (href: string) => {
    return activePath === href || activePath.startsWith(`${href}/`);
  };

  return (
    <nav className="grid gap-[0.35rem]" aria-label="Main">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'rounded-xl px-[0.95rem] py-[0.85rem] text-[0.96rem] font-[550] text-[#475a50] transition hover:translate-x-px hover:bg-[rgba(17,102,75,0.08)] hover:text-[#11664b]',
            isActive(link.href) &&
              'border-l-4 border-[#11664b] bg-[rgba(17,102,75,0.12)] pl-[0.85rem] font-bold text-[#11664b] hover:translate-x-0',
          )}
          aria-current={isActive(link.href) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
