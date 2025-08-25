"use client";
import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('bash', bash);

export default function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (lang) {
      ref.current.className = `language-${lang}`;
    }
    hljs.highlightElement(ref.current);
  }, [code, lang]);

  return (
    <div className="relative">
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="absolute right-2 top-2 text-xs border rounded px-2 py-1 bg-white"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-auto text-sm"><code ref={ref}>{code}</code></pre>
    </div>
  );
}
