export default function GithubLoginButton() {
  const handleGithub = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  return (
    <button
      type="button"
      onClick={handleGithub}
      className="flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 w-full"
    >
      {/* 깃허브 아이콘 */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 .2a8 8 0 00-2.53 15.6c.4.07.55-.17.55-.38v-1.32c-2.24.49-2.71-1.08-2.71-1.08-.36-.91-.89-1.15-.89-1.15-.73-.5.06-.49.06-.49.81.06 1.24.85 1.24.85.72 1.24 1.88.88 2.34.67.07-.52.28-.88.5-1.08-1.79-.2-3.67-.9-3.67-3.98 0-.88.32-1.6.84-2.17-.08-.2-.36-1.02.08-2.12 0 0 .68-.22 2.24.83A7.8 7.8 0 018 3.86a7.8 7.8 0 012.04.28c1.56-1.05 2.24-.83 2.24-.83.44 1.1.16 1.92.08 2.12.52.57.84 1.29.84 2.17 0 3.09-1.88 3.78-3.67 3.98.29.24.54.73.54 1.48v2.2c0 .21.15.45.55.38A8 8 0 008 .2z" />
      </svg>
      <span>GitHub로 계속하기</span>
    </button>
  );
}
