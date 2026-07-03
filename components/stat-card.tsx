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
    <section className="relative overflow-hidden rounded-2xl border border-[#edf3ef] bg-[linear-gradient(140deg,#fbfdfc_0%,#eef6f0_100%)] p-[1.6rem] shadow-[0_14px_32px_rgba(22,34,29,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#11664b]/30 hover:shadow-[0_18px_42px_rgba(22,34,29,0.08)] dark:border-[#222c26]/60 dark:bg-[linear-gradient(140deg,#0f1512_0%,#131a16_100%)] dark:shadow-[0_14px_32px_rgba(0,0,0,0.25)] dark:hover:border-[#10b981]/40 dark:hover:shadow-[0_18px_42px_rgba(0,0,0,0.35)]">
      {icon && (
        <>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff1e6] text-[#11664b] dark:bg-[#10b981]/10 dark:text-[#10b981]">
            {icon}
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#e7f3ed] text-[#a6d9b9] opacity-80 dark:bg-[#10b981]/5 dark:text-[#10b981]/15 dark:opacity-30">
            {icon}
          </div>
        </>
      )}
      <p className="m-0 text-[0.85rem] font-semibold text-[#4c5b51] dark:text-[#8da398]">{label}</p>
      <strong className="my-[0.6rem] block text-[1.75rem] tracking-[-0.05em] text-[#16221d] dark:text-[#ecf2ee]">
        {value}
      </strong>
      {detail && (
        <span className="m-0 text-[0.85rem] font-medium text-[#68766e] dark:text-[#8da398]">
          {detail}
        </span>
      )}
    </section>
  );
}
