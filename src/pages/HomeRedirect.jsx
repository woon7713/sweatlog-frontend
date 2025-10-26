import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// 이 컴포넌트는 UI가 없습니다. 오직 페이지 이동(리다이렉트)만 담당합니다.
export default function HomeRedirect() {
  const { isLoggedIn } = useAuthStore();

  // isLoggedIn 상태를 확인해서...
  if (isLoggedIn) {
    // 로그인 상태이면, /feed (소셜 피드) 페이지로 보냅니다.
    return <Navigate to="/feed" replace />;
  } else {
    // 로그아웃 상태이면, /landing (서비스 소개) 페이지로 보냅니다.
    return <Navigate to="/landing" replace />;
  }
}