import React, { useEffect, useMemo, useState } from "react";

const createDetailRow = () => ({ name: "", time: "", rep: "", set: "" });

export default function TemplateForm({
  open = false,
  initialValue,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const [purposeName, setPurposeName] = useState(
    initialValue?.purposeName ?? ""
  );
  const [rows, setRows] = useState(
    initialValue?.details?.length
      ? initialValue.details.map((d) => ({
          name: d.name ?? "",
          time: d.time ?? "",
          rep: d.rep ?? "",
          set: d.set ?? "",
        }))
      : [createDetailRow()]
  );

  useEffect(() => {
    if (!initialValue) return;
    setPurposeName(initialValue.purposeName ?? "");
    setRows(
      initialValue.details?.length
        ? initialValue.details.map((d) => ({
            name: d.name ?? "",
            time: d.time ?? "",
            rep: d.rep ?? "",
            set: d.set ?? "",
          }))
        : [createDetailRow()]
    );
  }, [initialValue]);

  const addRow = () => setRows((p) => [...p, createDetailRow()]);
  const removeRow = (idx) => setRows((p) => p.filter((_, i) => i !== idx));
  const changeRow = (idx, key, val) =>
    setRows((p) => {
      const copy = [...p];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });

  const invalid = useMemo(() => {
    if (!purposeName.trim()) return "템플릿 이름을 입력해주세요.";
    if (rows.length === 0) return "운동 항목을 최소 1개 추가해주세요.";
    for (const r of rows) {
      if (!r.name?.trim()) return "각 운동의 이름을 입력해주세요.";
      const hasTime = r.time !== "" && Number(r.time) > 0;
      const hasRepSet =
        r.rep !== "" && Number(r.rep) > 0 && r.set !== "" && Number(r.set) > 0;
      if (!hasTime && !hasRepSet) {
        return "각 운동은 '시간(분)' 또는 '횟수+세트' 중 하나는 입력해야 합니다.";
      }
    }
    return null;
  }, [purposeName, rows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invalid) return alert(invalid);

    const details = rows.map((r, idx) => ({
      name: r.name.trim(),
      orderNumber: idx + 1,
      time: r.time === "" ? null : Number(r.time),
      rep: r.rep === "" ? null : Number(r.rep),
      set: r.set === "" ? null : Number(r.set),
    }));

    const payload = { purposeName, details };
    await onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(760px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            템플릿 {initialValue?.isNew ? "만들기" : "수정"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1 text-sm"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 템플릿 이름 */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-900">
              템플릿 이름
            </label>
            <input
              type="text"
              value={purposeName}
              onChange={(e) => setPurposeName(e.target.value)}
              className="mt-1 block w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 shadow-sm outline-none focus:border-gray-900"
              placeholder="예: 하체 루틴, 아침 러닝"
            />
          </div>

          {/* 안내 문구 */}
          <p className="text-xs text-gray-500">
            각 운동은{" "}
            <span className="font-semibold text-gray-700">“횟수+세트”</span>{" "}
            또는 <span className="font-semibold text-gray-700">“시간(분)”</span>{" "}
            중 하나만 입력해도 저장됩니다.
          </p>

          {/* 항목들 */}
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-3 rounded-lg border-2 border-gray-200 bg-gray-50/80 p-4 transition hover:border-gray-300"
              >
                {/* 운동명 */}
                <div className="col-span-12 sm:col-span-4">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    운동명
                  </label>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => changeRow(idx, "name", e.target.value)}
                    className="w-full rounded-md border-2 border-white bg-white px-3 py-2 shadow-sm outline-none focus:border-gray-900"
                    placeholder="예: 스쿼트/러닝/요가"
                    aria-label="운동명"
                  />
                </div>

                {/* 횟수 + 세트 (그룹) */}
                <div className="col-span-12 sm:col-span-4 grid grid-cols-4 gap-3">
                  {/* 횟수 */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      횟수
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={row.rep}
                        onChange={(e) => changeRow(idx, "rep", e.target.value)}
                        className="w-full rounded-md border-2 border-white bg-white px-3 py-2 pr-11 shadow-sm outline-none focus:border-gray-900"
                        placeholder="예: 10"
                        inputMode="numeric"
                        aria-label="횟수"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        회
                      </span>
                    </div>
                  </div>

                  {/* 세트 */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      세트
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={row.set}
                        onChange={(e) => changeRow(idx, "set", e.target.value)}
                        className="w-full rounded-md border-2 border-white bg-white px-3 py-2 pr-12 shadow-sm outline-none focus:border-gray-900"
                        placeholder="예: 5"
                        inputMode="numeric"
                        aria-label="세트"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        세트
                      </span>
                    </div>
                  </div>
                </div>

                {/* 가운데 구분자 */}
                <div className="col-span-12 sm:col-span-1 flex items-center justify-center">
                  <span className="rounded-full border px-2 py-0.5 text-[11px] text-gray-600">
                    또는
                  </span>
                </div>

                {/* 시간(분) */}
                <div className="col-span-12 sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    시간
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={row.time}
                      onChange={(e) => changeRow(idx, "time", e.target.value)}
                      className="w-full rounded-md border-2 border-white bg-white px-3 py-2 pr-11 shadow-sm outline-none focus:border-gray-900"
                      placeholder="예: 30"
                      inputMode="numeric"
                      aria-label="시간"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      분
                    </span>
                  </div>
                </div>

                {/* 삭제 */}
                <div className="col-span-12 sm:col-span-1 flex items-end justify-end">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="rounded-md border px-3 py-2 text-xs text-gray-700 hover:bg-white"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              + 운동 항목 추가
            </button>
          </div>

          {/* 액션 */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm text-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
