export default function GoogleLoginButton() {
  const handleGoogle = () => {
    // 백엔드 OAuth 시작 엔드포인트
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      className="flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 w-full"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt=""
        className="h-4 w-4"
      />
      <span>Google로 계속하기</span>
    </button>
  );
}
