import Link from 'next/link';
import { deleteUser } from '@/app/actions/users';
import { UsersIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { SubmitButton } from '@/components/submit-button';
import { requireProfile } from '@/lib/auth';
import { money } from '@/lib/format';
import {
  dangerButtonClass,
  emptyClass,
  panelClass,
  tableClass,
  tdClass,
  thClass,
} from '@/lib/styles';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { supabase } = await requireProfile('admin');
  const { notice, error } = await searchParams;
  const [{ data: users }, { data: tasks }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('role', 'user')
      .order('full_name'),
    supabase.from('tasks').select('assigned_to, status, fee_cents'),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Users"
        subtitle="Manage worker accounts and review task progress from each user profile."
      />
      <Message notice={notice} error={error} />
      <section className={`${panelClass} overflow-x-auto`}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
            <UsersIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em] text-[#16221d] dark:text-[#ecf2ee]">
            Worker accounts
          </h2>
        </div>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>User</th>
              <th className={thClass}>Assigned</th>
              <th className={thClass}>Waiting review</th>
              <th className={thClass}>Approved value</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => {
              const work = (tasks ?? []).filter(
                (task) => task.assigned_to === user.id,
              );
              return (
                <tr key={user.id}>
                  <td className={tdClass}>
                    <strong className="text-[#16221d] dark:text-[#ecf2ee]">{user.full_name || 'Unnamed user'}</strong>
                  </td>
                  <td className={tdClass}>{work.length}</td>
                  <td className={tdClass}>
                    {work.filter((task) => task.status === 'completed').length}
                  </td>
                  <td className={tdClass}>
                    {money(
                      work
                        .filter((task) => task.status === 'approved')
                        .reduce((sum, task) => sum + task.fee_cents, 0),
                    )}
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Link
                        className="text-[0.9rem] font-semibold text-[#11664b] dark:text-[#10b981]"
                        href={`/users/${user.id}`}
                      >
                        Open user
                      </Link>
                      <details className="relative">
                        <summary className="cursor-pointer list-none text-[0.9rem] font-semibold text-[#ae3939] dark:text-red-400 [&::-webkit-details-marker]:hidden">
                          Delete
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-[260px] rounded-2xl border border-[#f2c9c9] bg-white p-4 text-left shadow-[0_18px_45px_rgba(22,34,29,0.14)] dark:border-[#ef4444]/30 dark:bg-[#131b17] dark:shadow-none">
                          <p className="m-0 text-[0.88rem] leading-5 text-[#5e4826] dark:text-amber-200">
                            Delete this worker account and its related worker
                            records. This cannot be undone.
                          </p>
                          <form action={deleteUser} className="mt-3">
                            <input
                              type="hidden"
                              name="user_id"
                              value={user.id}
                            />
                            <SubmitButton
                              label="Confirm delete"
                              pendingLabel="Deleting..."
                              className="w-full"
                              baseClassName={dangerButtonClass}
                            />
                          </form>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!users?.length && (
          <p className={emptyClass}>No registered users yet.</p>
        )}
      </section>
    </>
  );
}
