// src/components/GoalSettingModal.jsx
import React, { useState } from "react";
import Modal from "./Modal";
import { createGoal } from "@/api/goalsApi"; // ✨ API 함수 import

const today = () => new Date().toISOString().slice(0, 10);
const oneYearLater = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export default function GoalSettingModal({ isOpen, onClose, onGoalAdded }) {
  const [type, setType] = useState("WEIGHT");
  const [targetValue, setTargetValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetValue.trim()) return alert("목표 수치를 입력해주세요.");

    // ✅ 백엔드 GoalCreateRequest DTO에 맞게 payload 구성
    const payload = {
      type,
      startDt: today(),
      endDt: oneYearLater(), // 1년 뒤로 기본 설정
      status: "ACTIVE",
    };

    switch (type) {
      case "WEIGHT":
        payload.targetWeightKg = Number(targetValue);
        break;
      case "FREQUENCY":
        payload.targetSessionsPerWeek = Number(targetValue);
        break;
      // 참고: 다른 GoalType(STRENGTH, ENDURANCE 등)을 추가하려면 case를 확장하면 됩니다.
      default:
        alert("지원하지 않는 목표 유형입니다.");
        return;
    }

    setSubmitting(true);
    try {
      const response = await createGoal(payload);
      console.log("새 목표 생성 성공:", response.data);
      alert("새로운 목표가 추가되었습니다!");
      onGoalAdded(); // 부모 컴포넌트에 목표 추가 사실을 알림 (목록 새로고침용)
      onClose();
      setTargetValue(""); // 입력 필드 초기화
    } catch (err) {
      console.error("목표 생성 실패:", err);
      alert(err.response?.data?.message || "목표 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">새 목표 설정</h2>
        <div>
          <label htmlFor="type" className="block text-sm font-medium">
            목표 종류
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300"
          >
            <option value="WEIGHT">체중 감량/증량 (kg)</option>
            <option value="FREQUENCY">운동 빈도 (주 n회)</option>
          </select>
        </div>
        <div>
          <label htmlFor="targetValue" className="block text-sm font-medium">
            목표 수치
          </label>
          <input
            type="number"
            id="targetValue"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300"
            placeholder={
              type === "WEIGHT" ? "예: 70" : "예: 3"
            }
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "추가 중..." : "목표 추가"}
          </button>
        </div>
      </form>
    </Modal>
  );
}