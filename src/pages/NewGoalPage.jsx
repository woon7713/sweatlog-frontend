import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";

const today = new Date().toISOString().slice(0, 10);
const oneYearLater = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export default function NewGoalPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    goalType: "WEIGHT",
    targetWeightKg: "",
    targetLiftWeightKg: "",
    targetReps: "",
    targetDistanceM: "",
    targetDurationSec: "",
    targetSessionsPerWeek: "",
    targetBodyFatPct: "",
    targetMuscleMassKg: "",
    startDt: today,
    endDt: oneYearLater(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 백엔드 DTO에 맞게 데이터 가공
    const payload = {
      // ✨ --- 여기가 핵심 수정사항 --- ✨
      type: formData.goalType, // 'goalType'을 'type'으로 변경
      // ✨ --------------------------------- ✨
      startDt: formData.startDt,
      endDt: formData.endDt,
      status: "ACTIVE",
      ...(formData.goalType === "WEIGHT" && {
        targetWeightKg: Number(formData.targetWeightKg) || null,
      }),
      ...(formData.goalType === "STRENGTH" && {
        targetLiftWeightKg: Number(formData.targetLiftWeightKg) || null,
        targetReps: Number(formData.targetReps) || null,
        workoutId: 1,
      }),
      ...(formData.goalType === "ENDURANCE" && {
        targetDistanceM: Number(formData.targetDistanceM) || null,
        targetDurationSec: Number(formData.targetDurationSec) || null,
      }),
      ...(formData.goalType === "FREQUENCY" && {
        targetSessionsPerWeek: Number(formData.targetSessionsPerWeek) || null,
      }),
      ...(formData.goalType === "BODY_COMPOSITION" && {
        targetBodyFatPct: Number(formData.targetBodyFatPct) || null,
        targetMuscleMassKg: Number(formData.targetMuscleMassKg) || null,
      }),
    };

    try {
      await api.post("/users/profile/goals", payload);
      alert("새로운 목표가 성공적으로 설정되었습니다!");
      navigate("/goals");
    } catch (err) {
      console.error("목표 생성 에러:", err.response || err);
      alert(err.response?.data?.message || "목표 설정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTargetInputs = () => {
    switch (formData.goalType) {
      case "WEIGHT":
        return (
          <div>
            <label
              htmlFor="targetWeightKg"
              className="block text-sm font-medium text-gray-700"
            >
              목표 체중 (kg)
            </label>
            <input
              type="number"
              step="0.1"
              id="targetWeightKg"
              name="targetWeightKg"
              value={formData.targetWeightKg}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        );
      case "STRENGTH":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="targetLiftWeightKg"
                className="block text-sm font-medium text-gray-700"
              >
                목표 중량 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                id="targetLiftWeightKg"
                name="targetLiftWeightKg"
                value={formData.targetLiftWeightKg}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="targetReps"
                className="block text-sm font-medium text-gray-700"
              >
                목표 횟수 (reps)
              </label>
              <input
                type="number"
                id="targetReps"
                name="targetReps"
                value={formData.targetReps}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        );
      case "ENDURANCE":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="targetDistanceM"
                className="block text-sm font-medium text-gray-700"
              >
                목표 거리 (m)
              </label>
              <input
                type="number"
                id="targetDistanceM"
                name="targetDistanceM"
                value={formData.targetDistanceM}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="targetDurationSec"
                className="block text-sm font-medium text-gray-700"
              >
                목표 시간 (초)
              </label>
              <input
                type="number"
                id="targetDurationSec"
                name="targetDurationSec"
                value={formData.targetDurationSec}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        );
      case "FREQUENCY":
        return (
          <div>
            <label
              htmlFor="targetSessionsPerWeek"
              className="block text-sm font-medium text-gray-700"
            >
              주당 목표 운동 횟수
            </label>
            <input
              type="number"
              id="targetSessionsPerWeek"
              name="targetSessionsPerWeek"
              value={formData.targetSessionsPerWeek}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        );
      case "BODY_COMPOSITION":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="targetBodyFatPct"
                className="block text-sm font-medium text-gray-700"
              >
                목표 체지방률 (%)
              </label>
              <input
                type="number"
                step="0.1"
                id="targetBodyFatPct"
                name="targetBodyFatPct"
                value={formData.targetBodyFatPct}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="targetMuscleMassKg"
                className="block text-sm font-medium text-gray-700"
              >
                목표 근육량 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                id="targetMuscleMassKg"
                name="targetMuscleMassKg"
                value={formData.targetMuscleMassKg}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">새 목표 설정</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <div>
          <label
            htmlFor="goalType"
            className="block text-sm font-medium text-gray-700"
          >
            목표 종류
          </label>
          <select
            id="goalType"
            name="goalType"
            value={formData.goalType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="WEIGHT">체중 관리</option>
            <option value="STRENGTH">근력 (중량/횟수)</option>
            <option value="ENDURANCE">지구력 (거리/시간)</option>
            <option value="FREQUENCY">운동 빈도</option>
            <option value="BODY_COMPOSITION">체성분 (체지방/근육량)</option>
          </select>
        </div>

        {renderTargetInputs()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDt"
              className="block text-sm font-medium text-gray-700"
            >
              시작일
            </label>
            <input
              type="date"
              id="startDt"
              name="startDt"
              value={formData.startDt}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="endDt"
              className="block text-sm font-medium text-gray-700"
            >
              종료일
            </label>
            <input
              type="date"
              id="endDt"
              name="endDt"
              value={formData.endDt}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="text-right">
          {/* 파란색(bg-blue-600)을 우리가 정의한 빨간색(bg-brand-primary)으로 교체 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-red-dark disabled:bg-gray-400"
          >
            {isSubmitting ? "저장 중..." : "목표 저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
