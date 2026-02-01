export default function LoadingState() {
  return (
    <div className="flex justify-center items-center py-8">
      <div
        className="size-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin"
        aria-hidden
      />
    </div>
  );
}
