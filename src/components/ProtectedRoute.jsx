import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// 이 컴포넌트는 'children'이라는 특별한 prop을 받습니다.
// children은 이 컴포넌트로 감싸질 자식 컴포넌트(보호할 페이지)를 의미합니다.
function ProtectedRoute({ children }) {
  // 1. Zustand 스토어에서 로그인 상태를 가져옵니다.
  const { isLoggedIn } = useAuthStore();

  // 2. 만약 로그인하지 않았다면 (isLoggedIn이 false이면)...
  if (!isLoggedIn) {
    // '/login' 페이지로 강제 이동(리다이렉트)시킵니다.
    // 'replace' 옵션은 브라우저 히스토리에 현재 경로를 남기지 않아서,
    // 사용자가 '뒤로가기' 버튼을 눌렀을 때 무한 루프에 빠지는 것을 방지합니다.
    return <Navigate to="/login" replace />;
  }

  // 3. 만약 로그인했다면, 보호하려던 원래 페이지(children)를 그대로 보여줍니다.
  return children;
}

export default ProtectedRoute;