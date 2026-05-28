export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[18px] border border-[rgba(17,102,75,0.12)] bg-[linear-gradient(140deg,#fbfdfc_0%,#eef6f0_100%)] p-[1.6rem] shadow-[0_14px_32px_rgba(22,34,29,0.06)] transition hover:-translate-y-[3px] hover:border-[rgba(17,102,75,0.2)] hover:shadow-[0_18px_42px_rgba(22,34,29,0.1)]">
      {icon && (
        <>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff1e6] text-[#11664b]">
            {icon}
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#e7f3ed] text-[#a6d9b9] opacity-80">
            {icon}
          </div>
        </>
      )}
      <p className="m-0 text-[0.85rem] font-semibold text-[#4c5b51]">{label}</p>
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
