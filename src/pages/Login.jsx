// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Logo from "../components/Logo";
import useAuthStore from "../store/authStore";
import GoogleLoginButton from "../components/GoogleLoginButton";
import GithubLoginButton from "../components/GithubLoginButton";

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // username 필드도 시도하도록 payload 수정
      const payload = { email: formData.email, username: formData.email, password: formData.password };
      const response = await api.post("/auth/login", payload);
      const { user, access_token, accessToken } = response.data; // access_token, accessToken 둘 다 처리
      
      login(user, access_token || accessToken);

      alert(`${user.fullName || user.username}님, 환영합니다!`);
      navigate("/feed");
    } catch (error) {
      console.error("로그인 에러:", error);
      alert(error.response?.data?.message || "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo size="5xl" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            로그인
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input name="email" type="text" required className="relative block w-full appearance-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" placeholder="이메일 또는 아이디" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <input name="password" type="password" required className="relative block w-full appearance-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" placeholder="비밀번호" value={formData.password} onChange={handleChange} />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link to="/signup" className="font-medium text-brand-primary hover:text-brand-red-dark">
            계정이 없으신가요? 회원가입
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">또는</span></div>
        </div>

        <div className="space-y-3">
          <GoogleLoginButton />
          <GithubLoginButton />
        </div>
      </div>
    </div>
  );
}