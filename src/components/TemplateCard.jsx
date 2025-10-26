// src/components/TemplateCard.jsx
import React from "react";

export default function TemplateCard({
  template,
  onEdit,
  onDelete,
  onApply,
  onApplyToRoutine,
  applying = false,
  className = "", // ✅ 추가
}) {
  const { purposeName, details = [] } = template || {};
  const handleApply = onApply || onApplyToRoutine || (() => {});

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm
                  flex flex-col h-full ${className}`} // ✅ 동일 높이 & 세로 배치
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{purposeName || "템플릿"}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
          >
            수정
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-rose-300 bg-white px-2 py-1 text-xs text-rose-600"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 내용 영역: grow → 버튼은 항상 아래로 */}
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700 flex-grow min-h-[120px]">
        {details.slice(0, 5).map((d, i) => (
          <li key={i}>
            <span className="font-medium">{d?.name ?? "-"}</span>
            {typeof d?.rep === "number" && <> · {d.rep}회</>}
            {typeof d?.set === "number" && <> × {d.set}세트</>}
            {typeof d?.time === "number" && <> · {d.time}분</>}
          </li>
        ))}
        {details.length === 0 && (
          <li className="list-none text-gray-400">항목 없음</li>
        )}
      </ul>

      <button
        type="button"
        onClick={handleApply}
        disabled={applying}
        className="mt-auto w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {applying ? "루틴 생성 중..." : "이 템플릿으로 루틴 만들기"}
      </button>
    </div>
  );
}
