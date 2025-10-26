import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import TemplateForm from "@/components/TemplateForm";
import TemplateCard from "@/components/TemplateCard";

// 배열/페이지네이션 응답 모두 수용
function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function Templates({ onClose }) {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [editing, setEditing] = useState(null); // null=닫힘, {isNew:true}=생성, {id...}=수정
  const [applyingId, setApplyingId] = useState(null); // 변환 클릭 방지

  const pageParams = useMemo(() => ({ page: 0, size: 50 }), []);

  // 공통 새로고침
  const refresh = async () => {
    const res = await api.get("/routine/templates", { params: pageParams });
    const list = toArray(res.data).map((t) => ({
      ...t,
      id: t.id ?? t.templateId,
      purposeName: t.purposeName ?? t.name ?? "템플릿",
      details: Array.isArray(t.details) ? t.details : [],
    }));
    setTemplates(list);
  };

  // 목록 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await refresh();
      } catch (e) {
        console.error(e);
        setErr("템플릿을 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [pageParams]);

  // 생성/수정/삭제
  async function handleCreate(payload) {
    await api.post("/routine/templates", payload);
    await refresh();
  }
  async function handleUpdate(templateId, payload) {
    await api.put(`/routine/templates/${templateId}`, payload);
    await refresh();
  }
  async function handleDelete(templateId) {
    if (!window.confirm("이 템플릿을 삭제할까요?")) return;
    await api.delete(`/routine/templates/${templateId}`);
    await refresh();
  }

  // 루틴 목록으로 확실히 이동
  const goToRoutinesHard = () => {
    try {
      if (typeof onClose === "function") onClose();
    } catch {}
    window.location.assign("/routines");
  };

  // 템플릿 → 루틴 변환
  async function handleApplyToRoutine(templateId) {
    if (applyingId) return;
    setApplyingId(templateId);
    try {
      await api.post(`/routine/templates/${templateId}/toRoutine`);
      goToRoutinesHard();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "루틴으로 변환에 실패했습니다.";
      alert(msg);
    } finally {
      setApplyingId(null);
    }
  }

  function openCreate() {
    setEditing({ isNew: true, purposeName: "", details: [] });
  }
  function startEdit(t) {
    setEditing({
      isNew: false,
      id: t.id,
      purposeName: t.purposeName,
      details:
        t.details?.map((d, idx) => ({
          name: d.name ?? "",
          orderNumber: d.orderNumber ?? idx + 1,
          rep: d.rep ?? null,
          set: d.set ?? null,
          time: d.time ?? null,
        })) ?? [],
    });
  }
  function closeEditor(refreshAfter = false) {
    setEditing(null);
    if (refreshAfter) refresh();
  }

  if (loading) return <div className="p-6 text-center">불러오는 중...</div>;
  if (err)
    return (
      <div className="p-4 text-rose-700">
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
          {err}
        </div>
      </div>
    );

  // src/pages/Templates.jsx
  // ...상단 import/상태/함수 부분 그대로...

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">템플릿</h2>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + 새 템플릿 만들기
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-sm"
            >
              닫기
            </button>
          )}
        </div>
      </div>

      {/* ✅ 세로 리스트(루틴 목록처럼) */}
      <div className="space-y-4">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onEdit={() => startEdit(t)}
            onDelete={() => handleDelete(t.id)}
            onApply={() => handleApplyToRoutine(t.id)}
            onApplyToRoutine={() => handleApplyToRoutine(t.id)}
            applying={applyingId === t.id}
            className="w-full min-h-[220px]" // ✅ 동일 크기
          />
        ))}

        {templates.length === 0 && (
          <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-500">
            템플릿이 없습니다. “새 템플릿 만들기”로 추가해 보세요.
          </div>
        )}
      </div>

      {/* 생성/수정 폼 모달 */}
      <TemplateForm
        open={!!editing}
        initialValue={editing || undefined}
        onClose={() => closeEditor(false)}
        onSubmit={async (formValue) => {
          if (editing?.isNew) {
            await handleCreate(formValue);
          } else if (editing?.id) {
            await handleUpdate(editing.id, formValue);
          }
          closeEditor(true);
        }}
      />
    </div>
  );
}
