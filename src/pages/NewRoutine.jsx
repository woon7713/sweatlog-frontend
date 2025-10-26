import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";

/**
 * 무게(kg) 없이: name / rep / set / time 만 사용
 * 전송 DTO: { routineName, details: [{ name, orderNumber, rep, set, time }] }
 */
export default function NewRoutine() {
  const navigate = useNavigate();

  const [routineName, setRoutineName] = useState("");
  const [details, setDetails] = useState([
    { name: "", rep: "", set: "", time: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addRow = () =>
    setDetails((arr) => [...arr, { name: "", rep: "", set: "", time: "" }]);
  const removeRow = (idx) =>
    setDetails((arr) => arr.filter((_, i) => i !== idx));
  const changeRow = (idx, key, val) =>
    setDetails((arr) =>
      arr.map((r, i) => (i === idx ? { ...r, [key]: val } : r))
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // 백엔드 DTO에 맞춰 변환 (무게 없음)
    const cleaned = details
      .filter((d) => d.name?.trim())
      .map((d, idx) => ({
        name: d.name.trim(),
        orderNumber: idx + 1,
        rep: d.rep !== "" ? Number(d.rep) : null,
        set: d.set !== "" ? Number(d.set) : null,
        time: d.time !== "" ? Number(d.time) : null, // 분 단위
      }));

    const payload = {
      routineName,
      details: cleaned.length
        ? cleaned
        : [{ name: "운동", orderNumber: 1, rep: 0, set: 0, time: null }],
    };

    try {
      const res = await api.post("/routine", payload);
      const data = res?.data || {};
      const newId = data.id ?? data.routineId;
      alert("루틴이 저장되었습니다.");
      if (newId) navigate(`/routines/${newId}`, { state: data });
      else navigate("/routines");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "저장 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">새 루틴 만들기</h1>

      {/* 카드: 루틴 이름 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          루틴 이름
        </label>
        <input
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 가슴/삼두 루틴"
          required
        />
      </div>

      {/* 카드: 운동 상세 */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">운동 상세</span>
          <button
            type="button"
            onClick={addRow}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            + 추가
          </button>
        </div>

        <div className="space-y-3">
          {details.map((d, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              {/* 이름 4칸 */}
              <input
                className="col-span-4 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={d.name}
                onChange={(e) => changeRow(i, "name", e.target.value)}
                placeholder="운동명 (예: 스쿼트)"
              />
              {/* 횟수 3칸 */}
              <input
                className="col-span-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={d.rep}
                onChange={(e) => changeRow(i, "rep", e.target.value)}
                placeholder="횟수(rep)"
                inputMode="numeric"
              />
              {/* 세트 3칸 */}
              <input
                className="col-span-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={d.set}
                onChange={(e) => changeRow(i, "set", e.target.value)}
                placeholder="세트(set)"
                inputMode="numeric"
              />
              {/* 시간 + 삭제 2칸(같은 셀에 flex) */}

              <input
                className="col-span-2 w-full rounded-md border px-3 py-2"
                value={d.time}
                onChange={(e) => changeRow(i, "time", e.target.value)}
                placeholder="시간(분)"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="col-span-2 shrink-0 rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-200 font-bold "
              >
                제거
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-gray-200 pt-4 text-right">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
