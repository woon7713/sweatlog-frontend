// src/components/Header.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import GlobalSearch from "@/components/GlobalSearch.jsx";
import Logo from "@/components/Logo";

export default function Header() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout?.();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  const avatar = user?.profileImageUrl ?? (user?.id ? `https://i.pravatar.cc/150?u=${user.id}` : "https://placehold.co/80x80");
  const displayName = user?.nickname ?? user?.username ?? user?.fullName ?? "사용자";
  const profileHref = "/profile";

  const NavItem = ({ to, children }) => (
    <NavLink to={to} className={({ isActive }) => [
          "rounded-md px-3 py-1.5 text-sm font-medium",
          isActive
            ? "bg-brand-primary text-white" // 활성화 시: 보라색 배경, 흰 글씨
            : "text-gray-700 hover:bg-purple-100 hover:text-brand-primary-dark", // 비활성화 시: 호버 효과도 보라색 계열로 변경
        ].join(" ")} end>
      {children}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4 gap-4">
        <Link to="/">
          <Logo size="3xl" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <nav className="flex flex-wrap items-center gap-2">
            <NavItem to="/feed">둘러보기</NavItem>
            {isLoggedIn && <NavItem to="/my-posts">내 기록</NavItem>}
            <NavItem to="/routines">내 루틴</NavItem>
            {isLoggedIn && <NavItem to="/goals">내 목표</NavItem>}
            
            <div className="hidden md:block flex-1 min-w-[16rem] max-w-sm">
              <GlobalSearch compact />
            </div>
          </nav>
          <div className="block md:hidden">
            <GlobalSearch compact />
          </div>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          {isLoggedIn ? (
            <>
              <Link to={profileHref} className="ml-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100">
                <img src={avatar} alt="프로필" className="h-8 w-8 rounded-full object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/80x80"; }} />
                <span className="hidden sm:inline">{displayName}</span>
              </Link>
              <button type="button" onClick={handleLogout} className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100">
                로그인
              </Link>
              <Link to="/signup" className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}