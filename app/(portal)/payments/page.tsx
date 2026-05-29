import { recordPayment } from '@/app/actions/payments';
import { CalendarIcon, WalletIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { requireProfile } from '@/lib/auth';
import { money, monthLabel } from '@/lib/format';
import {
  buttonClass,
  emptyClass,
  inputClass,
  labelClass,
  panelClass,
  paymentGridClass,
  tableClass,
  tdClass,
  thClass,
} from '@/lib/styles';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const { supabase } = await requireProfile('admin');
  const [{ data: users }, { data: payments }] = await Promise.all([
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
  ]);

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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <WalletIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Record payment
          </h2>
        </div>
        <form action={recordPayment} className={paymentGridClass}>
          <label className={labelClass}>
            User
            <select className={inputClass} name="user_id" required>
              {(users ?? []).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || 'Unnamed user'}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Month
            <input
              className={inputClass}
              name="payment_month"
              type="month"
              required
            />
          </label>
          <label className={labelClass}>
            Amount (USD)
            <input
              className={inputClass}
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>
          <label className={labelClass}>
            Status
            <select className={inputClass} name="status">
              <option value="paid">Paid</option>
              <option value="due">Due</option>
            </select>
          </label>
          <label className={`${labelClass} lg:col-span-4`}>
            Note
            <input
              className={inputClass}
              name="note"
              placeholder="Optional payment reference"
            />
          </label>
          <button className={buttonClass}>Save payment</button>
        </form>
      </section>
      <section className={`${panelClass} overflow-x-auto`}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <WalletIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
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
                <td
                  className={`${tdClass} ${payment.status === 'paid' ? 'font-semibold text-[#11664b]' : ''}`}
                >
                  {payment.status === 'paid' ? 'Paid' : 'Due'}
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
