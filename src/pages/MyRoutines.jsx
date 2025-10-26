import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import Templates from "@/pages/Templates";
import { PlusCircle } from "lucide-react";

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function MyRoutines() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 여러 후보 엔드포인트 시도
        let res = await api.get("/routine").catch(() => null);
        if (!res) res = await api.get("/routines").catch(() => null);
        if (!res) res = await api.get("/routines/me").catch(() => null);

        const list = toArray(res?.data);
        const normalized = list.map((r) => ({
          ...r,
          id: r.id ?? r.routineId,
          routineName: r.routineName ?? r.name ?? r.title ?? "루틴",
          details: Array.isArray(r.details) ? r.details : [],
          exerciseCount:
            r.exerciseCount ??
            (Array.isArray(r.details) ? r.details.length : 0),
        }));
        setRoutines(normalized);
      } catch (err) {
        console.error("루틴 목록을 불러오는 데 실패:", err);
        setError("루틴 목록을 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (routineId) => {
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    try {
      await api.delete(`/routine/${routineId}`).catch(async () => {
        await api.delete(`/routines/${routineId}`);
      });
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
      alert("루틴이 삭제되었습니다.");
    } catch (err) {
      console.error("루틴 삭제 실패:", err);
      alert("루틴 삭제에 실패했습니다.");
    }
  };

  const goDetail = (routine) => {
    // state로 목록 아이템을 같이 넘겨서 첫 렌더 빠르게
    navigate(`/routines/${routine.id}`, { state: routine });
  };

  if (loading)
    return <div className="p-8 text-center">루틴 목록을 불러오는 중...</div>;

  if (error)
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      </div>
    );

  return (
    <>
      <div className="container mx-auto max-w-2xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">나의 루틴</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              템플릿
            </button>
            <Link
              to="/routines/new"
              className="flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark"
            >
              <PlusCircle size={16} /> 새 루틴 만들기
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {routines.length > 0 ? (
            routines.map((routine) => (
              <div
                key={routine.id ?? Math.random()}
                className="rounded-lg border p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => goDetail(routine)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {routine.routineName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {routine.exerciseCount ?? 0}개의 운동
                    </p>
                  </div>
                  <div
                    className="flex gap-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => navigate(`/routines/edit/${routine.id}`)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="text-sm font-semibold text-rose-600 hover:text-rose-500"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>아직 저장된 루틴이 없습니다.</p>
              <p>새로운 루틴을 만들어보세요!</p>
            </div>
          )}
        </div>
      </div>

      {showTemplates && (
        <TemplatesDrawer onClose={() => setShowTemplates(false)} />
      )}
    </>
  );
}

function TemplatesDrawer({ onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">템플릿</h2>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1 text-sm"
          >
            닫기
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
          <Templates />
        </div>
      </div>
    </div>
  );
}
