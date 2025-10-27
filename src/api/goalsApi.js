import api from './axios';

/**
 * 내 목표 목록 조회
 * GET /api/users/profile/goals
 */
export const fetchGoals = () => api.get("/users/profile/goals");

/**
 * 새 목표 생성
 * POST /api/users/profile/goals
 * @param {object} payload - GoalCreateRequest DTO
 */
export const createGoal = (payload) => api.post("/users/profile/goals", payload);

/**
 * 목표 상태 변경
 * PATCH /api/users/profile/goals/{id}/status
 * @param {number} goalId
 * @param {'ACTIVE'|'DONE'|'PAUSED'} status
 */
export const updateGoalStatus = (goalId, status) =>
  api.patch(`/users/profile/goals/${goalId}/status`, null, { params: { status } });

export const getGoalById = (goalId) => api.get(`/users/profile/goals/${goalId}`);
export const deleteGoal = (goalId) => api.delete(`/users/profile/goals/${goalId}`);
export const updateGoal = (goalId, payload) => api.put(`/users/profile/goals/${goalId}`, payload);