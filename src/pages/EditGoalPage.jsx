// src/pages/EditGoalPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGoalById, updateGoal } from '@/api/goalsApi';

export default function EditGoalPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  
  // formData의 초기값을 null로 설정하여 로딩 상태를 구분
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 페이지가 처음 로드될 때, goalId를 이용해 기존 목표 데이터를 불러옴
  useEffect(() => {
    if (!goalId) return;

    getGoalById(goalId)
      .then(res => {
        // 서버에서 받은 데이터로 formData 상태를 채움
        setFormData(res.data);
      })
      .catch(err => {
        console.error("목표 정보 로드 실패:", err);
        setError("목표 정보를 불러올 수 없습니다.");
      });
  }, [goalId]);

  // 입력창 값이 바뀔 때마다 formData 상태 업데이트
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // '저장' 버튼 클릭 시 실행
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 백엔드 GoalCreateRequest DTO 형식에 맞게 payload 구성
    const payload = {
        startDt: formData.startDt,
        endDt: formData.endDt,
        status: formData.status,
        type: formData.type, // type 필드도 포함
        targetWeightKg: formData.targetWeightKg,
        targetLiftWeightKg: formData.targetLiftWeightKg,
        targetReps: formData.targetReps,
        targetDistanceM: formData.targetDistanceM,
        targetDurationSec: formData.targetDurationSec,
        targetSessionsPerWeek: formData.targetSessionsPerWeek,
        targetBodyFatPct: formData.targetBodyFatPct,
        targetMuscleMassKg: formData.targetMuscleMassKg,
        workoutId: formData.workoutId,
    };

    try {
      await updateGoal(goalId, payload);
      alert('목표가 성공적으로 수정되었습니다!');
      navigate('/goals');
    } catch (err) {
      alert("목표 수정에 실패했습니다.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!formData) return <div className="p-6 text-center">목표 정보를 불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">목표 수정</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {/*
          NewGoalPage와 UI는 거의 동일하지만,
          각 input의 value가 `formData` 상태와 연결되어 기존 데이터를 보여줍니다.
        */}
        <div>
          <label className="block text-sm font-medium text-gray-700">목표 종류</label>
          <p className="mt-1 p-2 bg-gray-100 rounded-md text-gray-600">{formData.type}</p>
          <p className="text-xs text-gray-500 mt-1">목표 종류는 수정할 수 없습니다.</p>
        </div>
        
        {/* NewGoalPage의 renderTargetInputs와 유사한 로직을 여기에 직접 구현 */}
        {formData.type === 'WEIGHT' && (
          <div>
            <label htmlFor="targetWeightKg" className="block text-sm font-medium text-gray-700">목표 체중 (kg)</label>
            <input type="number" step="0.1" id="targetWeightKg" name="targetWeightKg" value={formData.targetWeightKg || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        )}
        {formData.type === 'FREQUENCY' && (
          <div>
            <label htmlFor="targetSessionsPerWeek" className="block text-sm font-medium text-gray-700">주당 목표 운동 횟수</label>
            <input type="number" id="targetSessionsPerWeek" name="targetSessionsPerWeek" value={formData.targetSessionsPerWeek || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        )}
        {/* ... 다른 목표 타입에 대한 입력 필드들도 위와 같이 추가 ... */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDt" className="block text-sm font-medium text-gray-700">시작일</label>
            <input type="date" id="startDt" name="startDt" value={formData.startDt || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="endDt" className="block text-sm font-medium text-gray-700">종료일</label>
            <input type="date" id="endDt" name="endDt" value={formData.endDt || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>

        <div className="text-right">
          <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-primary-dark disabled:bg-gray-400">
            {isSubmitting ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </div>
  );
}