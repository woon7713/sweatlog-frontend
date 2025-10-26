// src/api/followApi.js
import api from './axios';

/**
 * 특정 유저의 팔로워 목록 조회
 * GET /api/users/{userId}/followers
 */
export const fetchFollowers = (userId, page = 0, size = 20) =>
  api.get(`/users/${userId}/followers`, { params: { page, size } });

/**
 * 특정 유저의 팔로잉 목록 조회
 * GET /api/users/{userId}/following
 */
export const fetchFollowing = (userId, page = 0, size = 20) =>
  api.get(`/users/${userId}/following`, { params: { page, size } });