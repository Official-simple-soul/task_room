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

  return (
    <nav className="grid gap-[0.35rem]" aria-label="Main">
      {links.map((link) => {
        const linkActive = isActive(link.href);

        return (
          <div key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-[0.95rem] py-[0.85rem] text-[0.96rem] font-[550] text-[#475a50] dark:text-[#8da398] transition-all duration-200 hover:translate-x-0.5 hover:bg-[rgba(17,102,75,0.06)] hover:text-[#11664b] dark:hover:bg-[#10b981]/8 dark:hover:text-[#10b981]',
                linkActive &&
                  'border-l-4 border-[#11664b] bg-[rgba(17,102,75,0.1)] pl-[0.85rem] font-bold text-[#11664b] hover:translate-x-0 dark:border-[#10b981] dark:bg-[#10b981]/10 dark:text-[#10b981]',
              )}
              aria-current={linkActive ? 'page' : undefined}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
            {link.href === '/tasks' && projects.length ? (
              <div className="ml-8 mt-1.5 grid gap-1 border-l border-[#e2e8e3] dark:border-[#222c26] pl-3">
                {projects.map((project, index) => {
                  const href = `/tasks?project=${project.slug}`;
                  const projectActive =
                    activePath === '/tasks' &&
                    (activeProject === project.slug ||
                      (!activeProject && index === 0));

                  return (
                    <Link
                      className={cn(
                        'truncate rounded-lg px-3 py-1.5 text-[0.82rem] font-semibold text-[#68766e] dark:text-[#8da398] transition hover:bg-[#f6fbf7] hover:text-[#11664b] dark:hover:bg-[#1a2520] dark:hover:text-[#10b981]',
                        projectActive && 'bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]',
                      )}
                      href={href}
                      key={project.id}
                    >
                      {project.name}
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
