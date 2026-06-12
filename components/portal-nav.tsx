'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/styles';
import {
  CalendarIcon,
  ClipboardIcon,
  DashboardIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
  WalletIcon,
} from './icons';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PortalNavProps {
  isAdmin: boolean;
}

export function PortalNav({ isAdmin }: PortalNavProps) {
  const pathname = usePathname();

  const links: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
    ...(isAdmin
      ? [
          { href: '/users', label: 'Users', icon: UsersIcon },
          { href: '/tasks', label: 'Tasks', icon: ClipboardIcon },
          { href: '/records', label: 'Daily records', icon: CalendarIcon },
          { href: '/payments', label: 'Payments', icon: WalletIcon },
          { href: '/settings', label: 'Settings', icon: SettingsIcon },
        ]
      : [
          { href: '/tasks', label: 'Tasks', icon: ClipboardIcon },
          { href: '/earnings', label: 'Earnings', icon: WalletIcon },
          { href: '/settings', label: 'Settings', icon: SettingsIcon },
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
            'flex items-center gap-3 rounded-xl px-[0.95rem] py-[0.85rem] text-[0.96rem] font-[550] text-[#475a50] transition hover:translate-x-px hover:bg-[rgba(17,102,75,0.08)] hover:text-[#11664b]',
            isActive(link.href) &&
              'border-l-4 border-[#11664b] bg-[rgba(17,102,75,0.12)] pl-[0.85rem] font-bold text-[#11664b] hover:translate-x-0',
          )}
          aria-current={isActive(link.href) ? 'page' : undefined}
        >
          <link.icon className="h-5 w-5" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
