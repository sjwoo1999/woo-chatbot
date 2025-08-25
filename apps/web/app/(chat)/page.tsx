"use client";
import { useEffect, useRef, useState } from 'react';

interface Chunk { type: string; content?: string }
interface Message { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<EventSource | null>(null);

  const send = async () => {
    if (!input.trim()) return;
    const nextMessages = [...messages, { role: 'user', content: input }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: nextMessages }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let assistant = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const txt = decoder.decode(value);
        const lines = txt.split('\n\n').filter(Boolean);
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.replace('data: ', '');
          if (data === '[DONE]') break;
          try {
            const chunk: Chunk = JSON.parse(data);
            if (chunk.type === 'text' && chunk.content) {
              assistant += chunk.content;
              setMessages((prev) => {
                const copy = [...prev];
                if (copy[copy.length - 1]?.role === 'assistant') {
                  copy[copy.length - 1] = { role: 'assistant', content: assistant };
                } else {
                  copy.push({ role: 'assistant', content: assistant });
                }
                return copy;
              });
            }
          } catch {}
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.close();
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">woo-chatbot</h1>
      <div className="space-y-3 min-h-[50vh] border rounded p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <div className="inline-block rounded px-3 py-2 bg-neutral-100">{m.content}</div>
          </div>
        ))}
        {loading && <div className="text-neutral-400">응답 생성 중...</div>}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
               placeholder="메시지를 입력하세요" className="flex-1 border rounded px-3 py-2" />
        <button onClick={send} className="px-4 py-2 rounded bg-[#F76241] text-white">보내기</button>
      </div>
    </main>
  );
}
