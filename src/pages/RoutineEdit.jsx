import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

const emptyRow = { name: "", rep: "", set: "", time: "" };

export default function RoutineEdit() {
  const params = useParams();
  // 콜론이 섞여 들어오는 경우 대비 (콘솔의 :1 은 URL이 아님이지만 안전하게 방어)
  const id = useMemo(() => String(params.id ?? "").split(":")[0], [params.id]);

  const { state } = useLocation();
  const navigate = useNavigate();

  const [routineName, setRoutineName] = useState("");
  const [details, setDetails] = useState([emptyRow]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 공통: 서버 객체에서 details 꺼내기
  const extractDetails = (obj) =>
    Array.isArray(obj?.details)
      ? obj.details
      : Array.isArray(obj?.routineDetails)
      ? obj.routineDetails
      : Array.isArray(obj?.exercises)
      ? obj.exercises
      : [];

  // 상세 불러오기 (여러 엔드포인트 시도)
  useEffect(() => {
    async function load() {
      // 목록/상세에서 state로 넘어온 경우
      if (state) {
        fill(state);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1) /routine/{id}
        let res = await api.get(`/routine/${id}`).catch(() => null);
        // 2) /routines/{id}
        if (!res) res = await api.get(`/routines/${id}`).catch(() => null);
        // 3) /routine(page) → id 매칭
        if (!res) {
          const list = await api
            .get("/routine", { params: { page: 0, size: 1000 } })
            .catch(() => null);
          if (list) {
            const found = toArray(list.data).find(
              (r) => String(r.id ?? r.routineId) === String(id)
            );
            if (found) res = { data: found };
          }
        }

        if (res?.data) fill(res.data);
        else alert("루틴을 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function fill(src) {
    const rows = extractDetails(src);
    setRoutineName(src.routineName ?? src.name ?? "");
    setDetails(
      rows.length
        ? rows.map((d) => ({
            name: d?.name ?? "",
            rep: d?.rep ?? "",
            set: d?.set ?? "",
            time: d?.time ?? "",
          }))
        : [emptyRow]
    );
  }

  const addRow = () => setDetails((prev) => [...prev, emptyRow]);
  const removeRow = (idx) =>
    setDetails((prev) => prev.filter((_, i) => i !== idx));
  const changeRow = (idx, key, val) =>
    setDetails((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r))
    );

  async function tryMany(requests) {
    let lastErr = null;
    for (const fn of requests) {
      try {
        const r = await fn();
        return r;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const cleaned = details
      .filter((d) => d.name?.trim())
      .map((d, idx) => ({
        name: d.name.trim(),
        orderNumber: idx + 1,
        rep: d.rep !== "" ? Number(d.rep) : null,
        set: d.set !== "" ? Number(d.set) : null,
        time: d.time !== "" ? Number(d.time) : null,
      }));

    // DTO 여러 버전 시도
    const payloads = [
      { id, routineId: Number(id), routineName, details: cleaned },
      { id, routineId: Number(id), routineName, routineDetails: cleaned },
      { routineName, details: cleaned }, // 일부 백엔드는 id를 path로만 받음
      { routineName, routineDetails: cleaned },
    ];

    try {
      await tryMany([
        // PUT/PATCH + 단수/복수 + id path/body 조합 모두 시도
        () => api.put(`/routine/${id}`, payloads[0]),
        () => api.patch(`/routine/${id}`, payloads[0]),
        () => api.put(`/routines/${id}`, payloads[0]),
        () => api.patch(`/routines/${id}`, payloads[0]),
        () => api.put(`/routine`, payloads[0]),
        () => api.patch(`/routine`, payloads[0]),
        () => api.put(`/routine/${id}`, payloads[1]),
        () => api.patch(`/routine/${id}`, payloads[1]),
        () => api.put(`/routines/${id}`, payloads[1]),
        () => api.patch(`/routines/${id}`, payloads[1]),
        () => api.put(`/routine`, payloads[1]),
        () => api.patch(`/routine`, payloads[1]),
        () => api.put(`/routine/${id}`, payloads[2]),
        () => api.patch(`/routine/${id}`, payloads[2]),
        () => api.put(`/routines/${id}`, payloads[2]),
        () => api.patch(`/routines/${id}`, payloads[2]),
        () =>
          api.put(`/routine`, { ...payloads[2], id, routineId: Number(id) }),
        () =>
          api.patch(`/routine`, { ...payloads[2], id, routineId: Number(id) }),
        () => api.put(`/routine/${id}`, payloads[3]),
        () => api.patch(`/routine/${id}`, payloads[3]),
        () => api.put(`/routines/${id}`, payloads[3]),
        () => api.patch(`/routines/${id}`, payloads[3]),
        () =>
          api.put(`/routine`, { ...payloads[3], id, routineId: Number(id) }),
        () =>
          api.patch(`/routine`, { ...payloads[3], id, routineId: Number(id) }),
      ]);

      alert("수정되었습니다.");
      // 상세는 건너뛰고 목록으로
      navigate("/routines");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "수정 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">불러오는 중...</div>;

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 루틴 이름 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            루틴 이름
          </label>
          <input
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 하체/가슴 루틴"
            required
          />
        </div>

        {/* 운동 상세 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
              disabled={saving}
              className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
