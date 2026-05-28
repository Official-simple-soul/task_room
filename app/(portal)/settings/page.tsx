import { SettingsIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { ChangePasswordForm } from '@/components/password-reset-forms';
import { requireProfile } from '@/lib/auth';
import { panelClass } from '@/lib/styles';

export default async function SettingsPage() {
  const { profile } = await requireProfile();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle={`Manage security settings for ${profile.full_name || 'your account'}.`}
      />
      <section className={panelClass}>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <SettingsIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
              Change password
            </h2>
            <p className="mt-1 text-[0.92rem] text-[#68766e]">
              Use a strong password with at least 8 characters.
            </p>
          </div>
        </div>
        <ChangePasswordForm />
      </section>
    </>
  );
}
