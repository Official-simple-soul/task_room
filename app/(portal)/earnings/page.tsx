import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import {
  CheckIcon,
  ClipboardIcon,
  DollarIcon,
  WalletIcon,
} from '@/components/icons';
import { requireProfile } from '@/lib/auth';
import { money, monthLabel } from '@/lib/format';
import {
  emptyClass,
  panelClass,
  tableClass,
  tdClass,
  thClass,
} from '@/lib/styles';
import type { MonthlyMetric } from '@/lib/types';

type Payment = {
  payment_month: string;
  amount_cents: number;
  status: 'due' | 'paid';
};

export default async function EarningsPage() {
  const { supabase } = await requireProfile('user');
  const [{ data: metricData }, { data: paymentData }] = await Promise.all([
    supabase.rpc('get_my_monthly_metrics'),
    supabase
      .from('monthly_payments')
      .select('payment_month, amount_cents, status')
      .order('payment_month', { ascending: false }),
  ]);
  const metrics = (metricData ?? []) as MonthlyMetric[];
  const payments = (paymentData ?? []) as Payment[];
  const total = metrics.reduce(
    (sum, metric) => sum + Number(metric.earned_cents),
    0,
  );
  const paid = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount_cents, 0);

  return (
    <>
      <PageHeader
        eyebrow="Compensation"
        title="Earnings"
        subtitle="Only approved tasks contribute to earnings. Payments are recorded monthly by admin."
      />
      <div className="mb-8 grid grid-cols-1 gap-[1.3rem] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Approved earnings"
          value={money(total)}
          icon={<DollarIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Paid to date"
          value={money(paid)}
          icon={<CheckIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Outstanding"
          value={money(total - paid)}
          icon={<WalletIcon className="h-6 w-6" />}
        />
      </div>
      <section className={`${panelClass} overflow-x-auto`}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <ClipboardIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Monthly task results
          </h2>
        </div>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Month</th>
              <th className={thClass}>Attempted</th>
              <th className={thClass}>Approved</th>
              <th className={thClass}>Rejected</th>
              <th className={thClass}>Reworks</th>
              <th className={thClass}>Earned</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.month}>
                <td className={tdClass}>{monthLabel(metric.month)}</td>
                <td className={tdClass}>{metric.attempted}</td>
                <td className={tdClass}>{metric.approved}</td>
                <td className={tdClass}>{metric.rejected}</td>
                <td className={tdClass}>{metric.available_reworks}</td>
                <td className={tdClass}>{money(metric.earned_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!metrics.length && (
          <p className={emptyClass}>No task results recorded yet.</p>
        )}
      </section>
      <section className={panelClass}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <WalletIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Monthly payments
          </h2>
        </div>
        <div className="grid">
          {payments.map((payment) => (
            <div
              className="flex items-center justify-between gap-5 border-t border-[#edf1ee] py-[1.1rem] first:border-t-0 hover:bg-[rgba(231,243,237,0.3)]"
              key={payment.payment_month}
            >
              <strong>{monthLabel(payment.payment_month)}</strong>
              <span className="mt-1 block text-[0.87rem] font-medium text-[#68766e]">
                {money(payment.amount_cents)} |{' '}
                {payment.status === 'paid' ? 'Paid' : 'Due'}
              </span>
            </div>
          ))}
          {!payments.length && (
            <p className={emptyClass}>No payments recorded yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
