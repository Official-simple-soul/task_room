import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { requireProfile } from '@/lib/auth';
import { money } from '@/lib/format';
import { emptyClass, panelClass, tableClass, tdClass, thClass } from '@/lib/styles';

export default async function UsersPage() {
  const { supabase } = await requireProfile('admin');
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
      <section className={`${panelClass} overflow-x-auto`}>
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
                    <strong>{user.full_name || 'Unnamed user'}</strong>
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
                    <Link className="text-[0.9rem] font-semibold text-[#11664b]" href={`/users/${user.id}`}>
                      Open user
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!users?.length && <p className={emptyClass}>No registered users yet.</p>}
      </section>
    </>
  );
}
