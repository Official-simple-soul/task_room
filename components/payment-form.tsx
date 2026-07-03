'use client';

import { useState } from 'react';
import { recordPayment } from '@/app/actions/payments';
import { SubmitButton } from '@/components/submit-button';
import { cn, inputClass, labelClass, paymentGridClass } from '@/lib/styles';

type PaymentFormUser = {
  id: string;
  full_name: string | null;
};

export function PaymentForm({
  users,
  approvedFeeByUserMonth,
}: {
  users: PaymentFormUser[];
  approvedFeeByUserMonth: Record<string, Record<string, number>>;
}) {
  const [userId, setUserId] = useState(users[0]?.id ?? '');
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState('');

  const applySuggestedAmount = (nextUserId: string, nextMonth: string) => {
    if (!nextUserId || !nextMonth) return;
    const cents = approvedFeeByUserMonth[nextUserId]?.[nextMonth] ?? 0;
    setAmount((cents / 100).toFixed(2));
  };

  return (
    <form action={recordPayment} className={paymentGridClass}>
      <label className={labelClass}>
        User
        <select
          className={cn(inputClass, 'dark:bg-[#131b17]')}
          name="user_id"
          required
          value={userId}
          onChange={(event) => {
            setUserId(event.target.value);
            applySuggestedAmount(event.target.value, month);
          }}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id} className="dark:bg-[#131b17]">
              {user.full_name || 'Unnamed user'}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Month
        <input
          className={cn(inputClass, 'dark:bg-[#131b17]')}
          name="payment_month"
          type="month"
          required
          value={month}
          onChange={(event) => {
            setMonth(event.target.value);
            applySuggestedAmount(userId, event.target.value);
          }}
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
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <label className={labelClass}>
        Status
        <select className={cn(inputClass, 'dark:bg-[#131b17]')} name="status" defaultValue="paid">
          <option value="paid" className="dark:bg-[#131b17]">
            Paid
          </option>
          <option value="due" className="dark:bg-[#131b17]">
            Due
          </option>
        </select>
      </label>
      <label className={`${labelClass} lg:col-span-4`}>
        Note
        <input className={inputClass} name="note" placeholder="Optional payment reference" />
      </label>
      <SubmitButton label="Save payment" pendingLabel="Saving..." />
    </form>
  );
}
