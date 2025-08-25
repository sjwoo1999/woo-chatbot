"use client";

export default function RefusalCard({ category }: { category: string }) {
  const text: Record<string, string> = {
    politics: '정치/시사 관련 요청은 정책에 따라 응답할 수 없습니다.',
    risk: '위험/불법 조장 가능성이 있는 요청은 응답할 수 없습니다.',
    pii: '개인정보가 포함된 요청입니다. 민감정보는 저장/출력되지 않습니다.',
    unknown: '요청이 안전 정책에 의해 제한되었습니다.',
  };
  return (
    <div className="rounded border border-red-200 bg-red-50 text-red-700 text-sm p-3">
      <div className="font-medium mb-1">안전 정책에 따른 제한</div>
      <div>{text[category] || text.unknown}</div>
    </div>
  );
}
