'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/styles';
import type { Project } from '@/lib/types';
import {
  CalendarIcon,
  ClipboardIcon,
  DashboardIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
  WalletIcon,
} from './icons';
import { FaCheck } from 'react-icons/fa';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PortalNavProps {
  isAdmin: boolean;
  projects: Project[];
}

export function PortalNav({ isAdmin, projects }: PortalNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProject = searchParams.get('project');

  const links: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
    ...(isAdmin
      ? [
          { href: '/users', label: 'Users', icon: UsersIcon },
          { href: '/tasks', label: 'Tasks', icon: ClipboardIcon },
          { href: '/projects', label: 'Projects', icon: SettingsIcon },
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

  const renderIcon = (status: 'paused' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'paused':
        return (
          <div className="in-progress text-xs rounded-full bg-gray-600 text-white flex justify-center items-center size-3" />
        );
      case 'in_progress':
        return (
          <div className="in-progress text-xs rounded-full bg-green-500 text-white flex justify-center items-center size-3" />
        );
      case 'completed':
        return (
          <div className="in-progress text-xs rounded-full bg-blue-500 text-white flex justify-center items-center size-3" />
        );
      default:
        return null;
    }
  };

  return (
    <nav className="grid gap-[0.35rem]" aria-label="Main">
      {links.map((link) => {
        const linkActive = isActive(link.href);

        return (
          <div key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-[0.95rem] py-[0.85rem] text-[0.96rem] font-[550] text-[#475a50] transition hover:translate-x-px hover:bg-[rgba(17,102,75,0.08)] hover:text-[#11664b]',
                linkActive &&
                  'border-l-4 border-[#11664b] bg-[rgba(17,102,75,0.12)] pl-[0.85rem] font-bold text-[#11664b] hover:translate-x-0',
              )}
              aria-current={linkActive ? 'page' : undefined}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
            {link.href === '/tasks' && projects.length ? (
              <div className="ml-8 mt-1 grid gap-1 border-l border-[#e2e8e3] pl-1">
                {projects.map((project, index) => {
                  const href = `/tasks?project=${project.slug}`;
                  const projectActive =
                    activePath === '/tasks' &&
                    (activeProject === project.slug ||
                      (!activeProject && index === 0));

                  return (
                    <Link
                      className={cn(
                        'relative flex gap-2 items-center truncate rounded-lg px-3 py-2 text-[0.82rem] font-semibold text-[#68766e] transition hover:bg-[#f6fbf7] hover:text-[#11664b]',
                        projectActive && 'bg-[#e7f3ed] text-[#11664b]',
                      )}
                      href={href}
                      key={project.id}
                    >
                      <p>{project.name}</p>
                      {renderIcon(project.status)}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
