import { updatePaymentStatus } from '@/app/actions/payments';
import { CalendarIcon, WalletIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { PaymentForm } from '@/components/payment-form';
import { requireProfile } from '@/lib/auth';
import { money, monthLabel } from '@/lib/format';
import { cn, emptyClass, panelClass, tableClass, tdClass, thClass } from '@/lib/styles';
import { taskEffectiveMonth, type MonthBucketedTask } from '@/lib/task-months';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const { supabase } = await requireProfile('admin');
  const [{ data: users }, { data: payments }, { data: approvedTasks }] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, full_name, payment_bank_name, payment_account_number, payment_account_name',
      )
      .eq('role', 'user')
      .order('full_name'),
    supabase
      .from('monthly_payments')
      .select('*, profiles!monthly_payments_user_id_fkey(full_name)')
      .order('payment_month', { ascending: false }),
    supabase
      .from('tasks')
      .select(
        'assigned_to, status, fee_cents, created_at, claimed_at, completed_at, reviewed_at, approved_at',
      )
      .eq('status', 'approved'),
  ]);

  const approvedFeeByUserMonth: Record<string, Record<string, number>> = {};
  for (const task of (approvedTasks ?? []) as MonthBucketedTask[]) {
    const month = taskEffectiveMonth(task);
    approvedFeeByUserMonth[task.assigned_to] ??= {};
    approvedFeeByUserMonth[task.assigned_to][month] =
      (approvedFeeByUserMonth[task.assigned_to][month] ?? 0) + task.fee_cents;
  }

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Monthly payments"
        subtitle="Record payouts after approved task earnings have been confirmed."
      />
      <Message notice={notice} error={error} />
      <section className={panelClass}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
            <WalletIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em] text-[#16221d] dark:text-[#ecf2ee]">
            Record payment
          </h2>
        </div>
        <PaymentForm users={users ?? []} approvedFeeByUserMonth={approvedFeeByUserMonth} />
      </section>
      <section className={`${panelClass} overflow-x-auto`}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
            <WalletIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em] text-[#16221d] dark:text-[#ecf2ee]">
            Worker payment details
          </h2>
        </div>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>User</th>
              <th className={thClass}>Bank</th>
              <th className={thClass}>Account number</th>
              <th className={thClass}>Account name</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id}>
                <td className={tdClass}>{user.full_name || 'Unnamed user'}</td>
                <td className={tdClass}>{user.payment_bank_name || '-'}</td>
                <td className={tdClass}>
                  {user.payment_account_number || '-'}
                </td>
                <td className={tdClass}>{user.payment_account_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users?.length && <p className={emptyClass}>No workers found.</p>}
      </section>
      <section className={`${panelClass} overflow-x-auto`}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em] text-[#16221d] dark:text-[#ecf2ee]">
            Payment records
          </h2>
        </div>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>User</th>
              <th className={thClass}>Month</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((payment) => (
              <tr key={payment.id}>
                <td className={tdClass}>
                  {payment.profiles?.full_name || 'Unnamed user'}
                </td>
                <td className={tdClass}>{monthLabel(payment.payment_month)}</td>
                <td className={tdClass}>{money(payment.amount_cents)}</td>
                <td className={tdClass}>
                  <form action={updatePaymentStatus} className="flex items-center gap-3">
                    <input type="hidden" name="payment_id" value={payment.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={payment.status === 'paid' ? 'due' : 'paid'}
                    />
                    <span
                      className={cn(
                        'font-bold',
                        payment.status === 'paid'
                          ? 'text-[#11664b] dark:text-[#10b981]'
                          : 'text-[#68766e] dark:text-[#8da398]',
                      )}
                    >
                      {payment.status === 'paid' ? 'Paid' : 'Due'}
                    </span>
                    <button
                      type="submit"
                      className="cursor-pointer text-[0.8rem] font-semibold text-[#11664b] hover:underline dark:text-[#10b981]"
                    >
                      Mark as {payment.status === 'paid' ? 'Due' : 'Paid'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!payments?.length && (
          <p className={emptyClass}>No monthly payments recorded yet.</p>
        )}
      </section>
    </>
  );
}
