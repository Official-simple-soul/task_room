import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { PortalNav } from '@/components/portal-nav';
import { requireProfile } from '@/lib/auth';
import { brandClass, textButtonClass } from '@/lib/styles';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();
  const admin = profile.role === 'admin';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-r border-[#e2e8e3] bg-white px-[1.5rem] py-[1.3rem] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-[1.4rem] lg:py-8">
        <Link href="/dashboard" className={brandClass}>
          TaskRoom
        </Link>
        <p className="my-4 text-[0.96rem] font-semibold lg:my-0 lg:mb-[1.9rem] lg:mt-[2.7rem]">
          {profile.full_name || 'Account'}
          <span className="mt-1 block text-[0.8rem] font-normal text-[#68766e]">
            {admin ? 'Administrator' : 'Worker'}
          </span>
        </p>
        <PortalNav isAdmin={admin} />
        <form action={logout} className="mt-2 lg:mt-auto">
          <button className={textButtonClass}>Sign out</button>
        </form>
      </aside>
      <main className="w-full max-w-[1080px] px-[clamp(1.5rem,5vw,3.5rem)] py-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
