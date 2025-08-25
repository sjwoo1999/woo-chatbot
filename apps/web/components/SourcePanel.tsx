"use client";
import { useEffect, useState } from 'react';

export default function SourcePanel({ chunkId, title, index, onClose }: { chunkId?: string | null; title?: string; index?: number; onClose: () => void }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent('');
    if (!chunkId) return;
    (async () => {
      const r = await fetch(`/api/rag/chunks/${chunkId}`);
      const json = await r.json();
      if (json?.ok) {
        setContent(json.chunk.content || '');
      } else {
        setContent('미리보기를 불러오지 못했습니다.');
      }
    })();
  }, [chunkId]);

  if (!chunkId) return null;
  return (
    <aside className="fixed right-4 top-20 w-96 max-w-[90vw] h-[70vh] bg-white border rounded shadow p-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">{title} · #{index ?? '?'} </div>
        <button onClick={onClose} className="text-xs text-neutral-500">닫기</button>
      </div>
      <pre className="mt-3 text-xs whitespace-pre-wrap">{content}</pre>
    </aside>
  );
}
