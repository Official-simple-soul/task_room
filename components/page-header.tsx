import { eyebrowClass, pageSubtitleClass, pageTitleClass } from '@/lib/styles';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}) {
  return (
    <header className="mb-[2.2rem]">
      <div className="mb-[0.55rem] flex items-center gap-3">
        {icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e7f3ed] text-[#11664b]">
            {icon}
          </span>
        )}
        <p className={eyebrowClass}>{eyebrow}</p>
      </div>
      <h1 className={pageTitleClass}>{title}</h1>
      <p className={pageSubtitleClass}>{subtitle}</p>
    </header>
  );
}
