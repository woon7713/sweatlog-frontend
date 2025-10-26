// src/components/FollowButton.jsx
import React, { useState } from "react";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

export default function FollowButton({ targetUserId }) {
  const { user: me, followingSet, addFollowing, removeFollowing } = useAuthStore();
  const isFollowing = followingSet.has(Number(targetUserId));
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowClick = async () => {
    if (!targetUserId || !me || isLoading || me.id === Number(targetUserId)) return;
    setIsLoading(true);
    try {
      await api.post(`/users/${targetUserId}/follow`);
      if (isFollowing) {
        removeFollowing(Number(targetUserId));
      } else {
        addFollowing(Number(targetUserId));
      }
    } catch (error) {
      console.error("팔로우 처리 에러:", error);
      alert("요청 처리 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!me || me.id === Number(targetUserId)) {
    return null;
  }

  // ✨ UI 테마에 맞게 빨간색 버튼으로 설정된 상태
  const buttonStyle = isFollowing
    ? "bg-gray-200 text-gray-800 hover:bg-gray-300 text-xs px-2 py-1"
    : "bg-brand-primary text-white hover:bg-brand-red-dark text-xs px-2 py-1";

  return (
    <button
      onClick={handleFollowClick}
      disabled={isLoading}
      className={`rounded-md font-semibold ${buttonStyle}`}
    >
      {isLoading ? "처리중" : isFollowing ? "팔로잉" : "팔로우"}
    </button>
  );
}