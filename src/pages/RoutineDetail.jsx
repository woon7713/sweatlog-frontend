import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import api from "@/api/axios";

export default function RoutineDetail() {
  const params = useParams();
  // ✅ 콜론(:) 뒤에 붙은 꼬리 제거
  const id = String(params.id ?? "").split(":")[0];
  const { state } = useLocation();

  const [routine, setRoutine] = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let res = await api.get(`/routine/${id}`).catch(() => null);
        if (!res) res = await api.get(`/routines/${id}`).catch(() => null);

        const data = res?.data;
        if (!data) throw new Error("루틴을 찾을 수 없습니다.");

        setRoutine({
          ...data,
          id: data.id ?? data.routineId,
          routineName: data.routineName ?? data.name ?? "루틴",
          details: Array.isArray(data.details) ? data.details : [],
        });
      } catch (e) {
        console.error(e);
        setError("루틴 정보를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, state]);

  if (loading) return <div className="p-8 text-center">불러오는 중...</div>;
  if (error)
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      </div>
    );
  if (!routine) return null;

  const hasAnyTime = routine.details?.some((d) => d?.time != null);

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{routine.routineName}</h1>
        <div className="flex gap-2">
          <Link
            to={`/routines/edit/${routine.id}`}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200"
          >
            수정
          </Link>
          <Link
            to="/routines"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            목록
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">운동</th>
              <th className="px-3 py-2">횟수(rep)</th>
              <th className="px-3 py-2">세트(set)</th>
              {hasAnyTime && <th className="px-3 py-2">시간(분)</th>}
            </tr>
          </thead>
          <tbody>
            {(routine.details ?? []).map((d, i) => (
              <tr key={`d-${i}`} className="border-t">
                <td className="px-3 py-2">{d?.name ?? "-"}</td>
                <td className="px-3 py-2">{d?.rep ?? "-"}</td>
                <td className="px-3 py-2">{d?.set ?? "-"}</td>
                {hasAnyTime && <td className="px-3 py-2">{d?.time ?? "-"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
