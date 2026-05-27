export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <section className="rounded-[18px] border border-[rgba(17,102,75,0.12)] bg-[linear-gradient(140deg,#fbfdfc_0%,#eef6f0_100%)] p-[1.6rem] shadow-[0_14px_32px_rgba(22,34,29,0.06)] transition hover:-translate-y-[3px] hover:border-[rgba(17,102,75,0.2)] hover:shadow-[0_18px_42px_rgba(22,34,29,0.1)]">
      <p className="m-0 text-[0.85rem] font-medium text-[#68766e]">{label}</p>
      <strong className="my-[0.6rem] mb-[0.35rem] block text-[1.75rem] tracking-[-0.05em] text-[#16221d]">
        {value}
      </strong>
      {detail && (
        <span className="m-0 text-[0.85rem] font-medium text-[#68766e]">
          {detail}
        </span>
      )}
    </section>
  );
}
