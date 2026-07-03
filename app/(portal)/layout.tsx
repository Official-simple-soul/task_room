import { logout } from '@/app/actions/auth';
import { UserIcon } from '@/components/icons';
import { PortalNav } from '@/components/portal-nav';
import { RealtimeRefresh } from '@/components/realtime-refresh';
import { FormScrollRestoration } from '@/components/scroll-restoration';
import { SubmitButton } from '@/components/submit-button';
import { requireProfile } from '@/lib/auth';
import { getActiveProjects } from '@/lib/projects';
import { brandClass, cn, textButtonClass } from '@/lib/styles';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, supabase } = await requireProfile();
  const admin = profile.role === 'admin';
  const projects = await getActiveProjects(supabase);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <RealtimeRefresh />
      <FormScrollRestoration />
      <aside className="border-r border-[#e2e8e3] bg-white px-[1.5rem] py-[1.3rem] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-[1.4rem] lg:py-8">
        <Link href="/dashboard" className={brandClass}>
          TaskRoom
        </Link>
        <div className="my-4 flex items-center gap-3 lg:my-0 lg:mb-[1.9rem] lg:mt-[2.7rem]">
          <span className="relative flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#11664b,#0a513b)] text-white shadow-[0_10px_24px_rgba(17,102,75,0.22)]">
            <UserIcon className="size-6" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#15b46a]" />
          </span>
          <p className="m-0 text-[0.86rem] font-semibold">
            {profile.full_name.split(' ')[0] || 'Account'}
            <span className="mt-1 block text-[0.8rem] font-normal text-[#68766e]">
              {admin ? 'Administrator' : 'Worker'}
            </span>
          </p>
        </div>
        <PortalNav isAdmin={admin} projects={projects} />
        <div className="mt-6 lg:mt-auto grid gap-3">
          <ThemeToggle />
          <form action={logout} className="w-full">
            <SubmitButton
              label="Sign out"
              pendingLabel="Signing out..."
              baseClassName={cn(textButtonClass, 'w-full text-left justify-start')}
            />
          </form>
        </div>
      </aside>

      <main className="w-full max-w-[1080px] px-[clamp(1.5rem,5vw,3.5rem)] py-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
