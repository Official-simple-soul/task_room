import { eyebrowClass, pageSubtitleClass, pageTitleClass } from '@/lib/styles';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-[2.2rem]">
      <p className={eyebrowClass}>{eyebrow}</p>
      <h1 className={pageTitleClass}>{title}</h1>
      <p className={pageSubtitleClass}>{subtitle}</p>
    </header>
  );
}
