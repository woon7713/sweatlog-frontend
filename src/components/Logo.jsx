import React from "react";

/**
 * Sweatlog 워드마크
 * - size: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
 * - onDark: 다크 배경 위에서 사용할 때 글자색을 흰색으로
 * - className: 추가 클래스
 */
export default function Logo({ size = "3xl", onDark = false, className = "" }) {
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
    "2xl": "text-3xl",
    "3xl": "text-4xl",
  };

  const baseColor = onDark ? "text-white" : "text-gray-900";

  return (
    <div
      aria-label="Sweatlog"
      className={[
        "font-extrabold leading-none tracking-tight select-none inline-flex items-baseline",
        sizes[size] || sizes["3xl"],
        baseColor,
        className,
      ].join(" ")}
    >
      <span>SweatLo</span>
      {/* 마지막 g를 강조 색상으로 */}
      <span className="text-brand-primary">g</span>
    </div>
  );
}
