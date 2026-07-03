export function FormFeedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;

  return (
    <p
      className={`rounded-[10px] px-4 py-3 text-[0.9rem] font-medium ${
        error
          ? 'bg-[#fde9e9] text-[#ae3939] dark:bg-[#2c0f0f] dark:text-[#fca5a5]'
          : 'bg-[#e7f3ed] text-[#11664b] dark:bg-[#12281e] dark:text-[#10b981]'
      }`}
      role="status"
      aria-live="polite"
    >
      {error ?? success}
    </p>
  );
}
