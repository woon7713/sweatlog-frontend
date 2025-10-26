import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import ImageUploader from "@/components/ImageUploader";

const today = () => new Date().toISOString().slice(0, 10);
const hhmm = (t) => (typeof t === "string" ? t.slice(0, 5) : "");

export default function Post() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const editing = Boolean(state?.edit && state?.post);
  const initial = useMemo(() => state?.post ?? {}, [state]);

  const [title, setTitle] = useState(editing ? initial.title ?? "" : "");
  const [memo, setMemo] = useState(editing ? initial.memo ?? "" : "");
  const [category, setCategory] = useState(
    editing ? initial.category ?? "WEIGHT_TRAINING" : "WEIGHT_TRAINING"
  );
  const [date, setDate] = useState(editing ? initial.date ?? today() : today());
  const [startTime, setStartTime] = useState(
    editing ? hhmm(initial.startTime ?? "09:00") : "09:00"
  );
  const [endTime, setEndTime] = useState(
    editing ? hhmm(initial.endTime ?? "10:00") : "10:00"
  );
  const [rows, setRows] = useState(
    editing
      ? (initial.details ?? initial.postDetails ?? []).map((d) => ({
          name: d.name ?? "",
          weight: d.weight ?? "",
          reps: d.reps ?? "",
          sets: d.sets ?? "",
          duration: d.duration ?? "",
        }))
      : [{ name: "", weight: "", reps: "", sets: "", duration: "" }]
  );
  const [imageUrl, setImageUrl] = useState(
    editing ? initial.imageUrl ?? "" : ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && !initial?.id && !initial?.postId) {
      console.warn("[Post] edit mode but no id in state");
    }
  }, [editing, initial]);

  const addRow = () =>
    setRows((a) => [
      ...a,
      { name: "", weight: "", reps: "", sets: "", duration: "" },
    ]);
  const removeRow = (i) => setRows((a) => a.filter((_, idx) => idx !== i));
  const changeRow = (i, k, v) =>
    setRows((a) => a.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  const details = rows
    .filter((d) => d.name?.trim())
    .map((d) => ({
      name: d.name?.trim(),
      weight: d.weight !== "" ? Number(d.weight) : null,
      reps: d.reps !== "" ? Number(d.reps) : null,
      sets: d.sets !== "" ? Number(d.sets) : null,
      duration: d.duration !== "" ? Number(d.duration) : null,
    }));

  const ensure = details.length
    ? details
    : [{ name: "운동", weight: 0, reps: 0, sets: 0, duration: 0 }];

  const base = {
    title: title?.trim(),
    memo: memo?.trim(),
    category,
    date,
    startTime: `${startTime}:00`,
    endTime: `${endTime}:00`,
    imageUrl: imageUrl || null,
  };

  async function tryCreate(payload) {
    return api.post("/posts", payload);
  }
  async function tryUpdate(id, payload) {
    const endpoints = [
      { method: "put", body: { ...payload, details: ensure } },
      { method: "put", body: { ...payload, postDetails: ensure } },
      { method: "patch", body: { ...payload, details: ensure } },
      { method: "patch", body: { ...payload, postDetails: ensure } },
    ];
    let lastErr;
    for (const ep of endpoints) {
      try {
        const res = await api[ep.method](`/posts/${id}`, ep.body);
        return res;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      if (editing) {
        const id = initial.id ?? initial.postId;
        if (!id) throw new Error("수정할 게시물 ID가 없습니다.");
        await tryUpdate(id, base);
        alert("수정되었습니다.");
      } else {
        let lastErr = null;
        for (const p of [
          { ...base, details: ensure },
          { ...base, postDetails: ensure },
        ]) {
          try {
            await tryCreate(p);
            lastErr = null;
            break;
          } catch (e2) {
            lastErr = e2;
          }
        }
        if (lastErr) throw lastErr;
        alert("저장되었습니다.");
      }
      navigate("/feed", { replace: true });
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "요청 실패";
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">
        {editing ? "운동 기록 수정" : "운동 기록하기"}
      </h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-md border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          required
        />
        <textarea
          className="w-full rounded-md border px-3 py-2"
          rows={4}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모"
        />

        {/* 이미지 업로드 */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            인증샷 (선택)
          </label>
          <ImageUploader onUploadSuccess={setImageUrl} uploadContext="post" />
          {imageUrl && (
            <p className="mt-2 break-all text-xs text-gray-500">
              업로드된 URL: {imageUrl}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* ✅ 카테고리 옵션 업데이트 */}
          <select
            className="rounded-md border px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="WEIGHT_TRAINING">웨이트</option>
            <option value="YOGA">요가</option>
            <option value="CARDIO">유산소</option>
            <option value="PILATES">필라테스</option>
          </select>

          <input
            type="date"
            className="rounded-md border px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className="rounded-md border px-3 py-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <input
            type="time"
            className="rounded-md border px-3 py-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">운동 상세</label>
            <button
              type="button"
              onClick={addRow}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
            >
              + 추가
            </button>
          </div>

          {rows.map((d, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className="col-span-4 rounded-md border px-3 py-2"
                placeholder="운동명"
                value={d.name}
                onChange={(e) => changeRow(i, "name", e.target.value)}
              />
              <input
                className="col-span-2 rounded-md border px-3 py-2"
                placeholder="무게"
                value={d.weight}
                onChange={(e) => changeRow(i, "weight", e.target.value)}
              />
              <input
                className="col-span-2 rounded-md border px-3 py-2"
                placeholder="횟수"
                value={d.reps}
                onChange={(e) => changeRow(i, "reps", e.target.value)}
              />
              <input
                className="col-span-2 rounded-md border px-3 py-2"
                placeholder="세트"
                value={d.sets}
                onChange={(e) => changeRow(i, "sets", e.target.value)}
              />
              <input
                className="col-span-1 rounded-md border px-3 py-2"
                placeholder="분"
                value={d.duration}
                onChange={(e) => changeRow(i, "duration", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="col-span-1 rounded-md border px-3 py-2 text-sm"
              >
                제거
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving
            ? editing
              ? "수정 중..."
              : "저장 중..."
            : editing
            ? "수정"
            : "저장"}
        </button>
      </form>
    </div>
  );
}
