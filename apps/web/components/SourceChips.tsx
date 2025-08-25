"use client";

export interface SourceItem { docId: string; title: string; chunkId: string; index?: number }

export default function SourceChips({ sources, onClick }: { sources: SourceItem[]; onClick: (s: SourceItem) => void }) {
  if (!sources?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {sources.map((s, i) => (
        <button key={i} onClick={() => onClick(s)} className="text-xs bg-neutral-100 hover:bg-neutral-200 rounded px-2 py-1">
          {s.title} · #{s.index ?? '?'}
        </button>
      ))}
    </div>
  );
}
