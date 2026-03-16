"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="text-center py-8 space-y-4">
      <p className="text-destructive">エラーが発生しました</p>
      <button onClick={reset} className="underline text-sm">
        再試行
      </button>
    </div>
  );
}
