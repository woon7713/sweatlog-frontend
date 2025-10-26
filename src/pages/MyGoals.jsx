// src/pages/MyGoals.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { PlusCircle } from "lucide-react";

// 백엔드 Enum과 매칭되는 객체 (화면 표시용)
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

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/users/profile/goals");
      // 백엔드 응답이 배열 형태가 아닐 경우를 대비해 안전하게 처리
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
      // 백엔드 API 형식에 맞게 status를 쿼리 파라미터로 전송
      await api.patch(`/users/profile/goals/${goalId}/status`, null, {
        params: { status: newStatus },
      });
      fetchGoals(); // 상태 변경 후 목록을 다시 불러와 화면을 갱신
    } catch (err) {
      alert("상태 변경에 실패했습니다.");
      console.error(err);
    }
  };

  const renderGoalDetails = (goal) => {
    switch (goal.goalType) {
      case "WEIGHT":
        return `목표 체중: ${goal.targetWeightKg}kg`;
      case "STRENGTH":
        return `${goal.workoutName || "운동"} 목표 중량: ${
          goal.targetLiftWeightKg
        }kg`;
      case "FREQUENCY":
        return `주 ${goal.targetSessionsPerWeek}회 운동하기`;
      default:
        return "세부 목표 정보";
    }
  };

  if (isLoading) return <div className="p-6 text-center">로딩 중...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ✨ --- 이 부분을 수정합니다 --- ✨ */}
      <div className="flex justify-end items-center mb-6">
        <Link to="/goals/new" className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-red-dark">
          <PlusCircle size={20} /> 새 목표 설정
        </Link>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
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
                    {GOAL_TYPE_LABELS[goal.goalType]} 목표
                  </h2>
                  <p className="text-sm text-gray-500">
                    {goal.startDt} ~ {goal.endDt}
                  </p>
                  <p className="mt-2 text-gray-700">
                    {renderGoalDetails(goal)}
                  </p>
                </div>
                <select
                  value={goal.status}
                  onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                  className="text-sm border-gray-300 rounded-md"
                >
                  <option value="ACTIVE">진행중</option>
                  <option value="DONE">완료</option>
                  <option value="PAUSED">중단</option>
                </select>
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
