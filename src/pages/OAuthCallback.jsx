import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import api from "@/api/axios";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    // 백엔드에서 보내준 쿼리 파라미터
    const accessToken = params.get("token");
    // 필요하면 쓸 수 있으니까 남겨두는 것. 지금 store에는 안 넣음.
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      // axios 전역 Authorization 헤더 세팅 (이후 api 요청 자동 인증)
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // 우리 zustand 스토어 인터페이스:
      // login(user, accessToken)
      // 지금 백엔드 리다이렉트에는 user 정보(userId 등)는 안 실려오니까
      // 최소 구조만 넘겨줌. (null 대신 {} 써도 되고 상관없음)
      login({}, accessToken);
    }

    // 로그인 후 원하는 곳으로 보내기
    navigate("/feed");
  }, [params, navigate, login]);

  // 로딩 화면 (잠깐만 보임)
  return (
    <div className="p-8 text-center text-gray-600">
      소셜 계정으로 로그인 중입니다...
    </div>
  );
}
