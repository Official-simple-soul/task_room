export function Message({
  notice,
  error,
}: {
  notice?: string;
  error?: string;
}) {
  if (!notice && !error) return null;
  return (
    <div
      className={`mb-5 rounded-[10px] px-4 py-[0.85rem] text-[0.9rem] ${
        error ? 'bg-[#fde9e9] text-[#ae3939]' : 'bg-[#e7f3ed] text-[#11664b]'
      }`}
    >
      {error ?? notice}
    </div>
  );
}
