import { updatePaymentMethod } from '@/app/actions/profile';
import { SettingsIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { ChangePasswordForm } from '@/components/password-reset-forms';
import { SubmitButton } from '@/components/submit-button';
import { requireProfile } from '@/lib/auth';
import { fieldGridClass, inputClass, labelClass, panelClass } from '@/lib/styles';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { supabase, profile } = await requireProfile();
  const { notice, error } = await searchParams;
  const isWorker = profile.role === 'user';
  const { data: paymentProfile } = isWorker
    ? await supabase
        .from('profiles')
        .select(
          'payment_bank_name, payment_account_number, payment_account_name',
        )
        .eq('id', profile.id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle={`Manage account settings for ${profile.full_name || 'your account'}.`}
      />
      <Message notice={notice} error={error} />
      {isWorker && (
        <section className={panelClass}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
              <SettingsIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
                Payment method
              </h2>
              <p className="mt-1 text-[0.92rem] text-[#68766e]">
                Add the bank details admin should use for monthly payouts.
              </p>
            </div>
          </div>
          <form action={updatePaymentMethod} className={fieldGridClass}>
            <label className={labelClass}>
              Bank
              <input
                className={inputClass}
                name="payment_bank_name"
                defaultValue={paymentProfile?.payment_bank_name ?? ''}
                placeholder="Bank name"
              />
            </label>
            <label className={labelClass}>
              Account number
              <input
                className={inputClass}
                name="payment_account_number"
                defaultValue={paymentProfile?.payment_account_number ?? ''}
                placeholder="0123456789"
              />
            </label>
            <label className={labelClass}>
              Account name
              <input
                className={inputClass}
                name="payment_account_name"
                defaultValue={paymentProfile?.payment_account_name ?? ''}
                placeholder="Account holder name"
              />
            </label>
            <SubmitButton label="Save payment method" pendingLabel="Saving..." />
          </form>
        </section>
      )}
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
