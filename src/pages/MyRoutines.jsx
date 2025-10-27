// src/pages/MyRoutines.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import Templates from "@/pages/Templates";
import { PlusCircle, MoreVertical } from "lucide-react";

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
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/routine");
        const list = toArray(res?.data);
        const normalized = list.map((r) => ({
          ...r,
          id: r.id ?? r.routineId,
          routineName: r.routineName ?? r.name ?? r.title ?? "루틴",
          details: Array.isArray(r.details) ? r.details : [],
          exerciseCount: r.details?.length || 0,
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
    if (!window.confirm("이 루틴을 정말 삭제하시겠어요?")) return;
    try {
      await api.delete(`/routine/${routineId}`);
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
      alert("루틴이 삭제되었습니다.");
    } catch (err) {
      console.error("루틴 삭제 실패:", err);
      alert("루틴 삭제에 실패했습니다.");
    }
  };

  const goDetail = (routine) => {
    navigate(`/routines/${routine.id}`, { state: routine });
  };

  const toggleMenu = (e, routineId) => {
    e.stopPropagation();
    setOpenMenuId(currentId => (currentId === routineId ? null : routineId));
  };

  if (loading) return <div className="p-8 text-center">루틴 목록을 불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      <div className="container mx-auto max-w-2xl p-4" onClick={() => setOpenMenuId(null)}>
        <div className="flex justify-end items-center mb-6 gap-2">
          {/* <div className="flex gap-2"> 를 제거하여 중첩을 피함 */}
            <button
              onClick={() => setShowTemplates(true)}
              className="rounded-md border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              템플릿에서 가져오기
            </button>
            <Link
              to="/routines/new"
              className="flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark"
            >
              <PlusCircle size={16} /> 새 루틴 만들기
            </Link>
        </div>

        <div className="space-y-4">
          {routines.length > 0 ? (
            routines.map((routine) => (
              <div
                key={routine.id ?? Math.random()}
                className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer flex-1 mr-4" onClick={() => goDetail(routine)}>
                    <h2 className="text-lg font-semibold text-gray-800">{routine.routineName}</h2>
                    <p className="text-sm text-gray-500">{routine.exerciseCount}개의 운동</p>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => toggleMenu(e, routine.id)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                      title="더보기"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === routine.id && (
                      <div
                        className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-md border bg-white shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/routines/edit/${routine.id}`)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(routine.id)}
                          className="block w-full px-4 py-2 text-left text-sm text-brand-red hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">아직 저장된 루틴이 없습니다.</p>
              <p className="mt-1">새로운 루틴을 만들어보세요!</p>
            </div>
          )}
        </div>
      </div>

      {showTemplates && <TemplatesDrawer onClose={() => setShowTemplates(false)} />}
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
