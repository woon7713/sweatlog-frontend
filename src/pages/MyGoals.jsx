// src/pages/MyGoals.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { deleteGoal } from "@/api/goalsApi";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const GOAL_TYPE_LABELS = {
  WEIGHT: "체중 관리",
  STRENGTH: "근력",
  ENDURANCE: "지구력",
  FREQUENCY: "운동 빈도",
  BODY_COMPOSITION: "체성분",
};

const GOAL_STATUS_LABELS = {
  ACTIVE: "진행중",
  DONE: "완료",
  PAUSED: "중단",
};

export default function MyGoals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/users/profile/goals");
      setGoals(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("목표를 불러오는 데 실패했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      await api.patch(`/users/profile/goals/${goalId}/status`, null, {
        params: { status: newStatus },
      });
      fetchGoals();
    } catch (err) {
      alert("상태 변경에 실패했습니다.");
      console.error(err);
    }
  };
  
  const handleDelete = async (goalId) => {
    if (!window.confirm("이 목표를 정말 삭제하시겠습니까?")) return;
    try {
      await deleteGoal(goalId);
      fetchGoals(); // 삭제 후 목록 새로고침
    } catch (err) {
      alert("목표 삭제에 실패했습니다.");
    }
  };

  // ✨ renderGoalDetails 함수를 한 번만 올바르게 선언합니다.
  const renderGoalDetails = (goal) => {
    // 백엔드 DTO의 필드 이름인 'type'을 사용합니다.
    switch (goal.type) {
      case "WEIGHT":
        return `목표 체중: ${goal.targetWeightKg}kg`;
      case "STRENGTH":
        return `${goal.workoutName || "운동"} 목표: ${goal.targetLiftWeightKg || ''}kg / ${goal.targetReps || ''}회`;
      case "FREQUENCY":
        return `주 ${goal.targetSessionsPerWeek}회 운동하기`;
      case "ENDURANCE":
        return `목표: ${goal.targetDistanceM || ''}m / ${goal.targetDurationSec || ''}초`;
      case "BODY_COMPOSITION":
        return `체지방/근육량: ${goal.targetBodyFatPct || ''}% / ${goal.targetMuscleMassKg || ''}kg`;
      default:
        return "세부 정보를 확인하세요.";
    }
  };

  if (isLoading) return <div className="p-6 text-center">로딩 중...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/goals/new"
          className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-primary-dark"
        >
          <PlusCircle size={20} /> 새 목표 설정
        </Link>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      goal.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {GOAL_STATUS_LABELS[goal.status]}
                  </span>
                  <h2 className="text-xl font-semibold mt-2">
                    {GOAL_TYPE_LABELS[goal.type]} 목표
                  </h2>
                  <p className="text-sm text-gray-500">
                    {goal.startDt} ~ {goal.endDt}
                  </p>
                  <p className="mt-2 text-gray-700">
                    {renderGoalDetails(goal)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/goals/edit/${goal.id}`)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                    title="수정"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                    title="삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                  <select
                    value={goal.status}
                    onChange={(e) =>
                      handleStatusChange(goal.id, e.target.value)
                    }
                    className="text-sm border-gray-300 rounded-md"
                    title="상태 변경"
                  >
                    <option value="ACTIVE">진행중</option>
                    <option value="DONE">완료</option>
                    <option value="PAUSED">중단</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">설정된 목표가 없습니다.</p>
          <p className="mt-1">새로운 목표를 설정하고 동기를 부여받으세요!</p>
        </div>
      )}
    </div>
  );
}