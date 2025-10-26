import React from "react";

// 이 컴포넌트는 3개의 props를 받습니다:
// - isOpen: 모달이 열려있는지 여부 (true/false)
// - onClose: 모달을 닫는 함수
// - children: 모달 안에 보여줄 실제 내용 (프로필 수정 폼 등)
export default function Modal({ isOpen, onClose, children }) {
  // isOpen이 false이면 아무것도 렌더링하지 않습니다.
  if (!isOpen) return null;

  return (
    // 배경을 어둡게 만드는 반투명 레이어
    <div
      onClick={onClose} // 배경 클릭 시 모달이 닫히도록 합니다.
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      {/* 실제 모달 콘텐츠 */}
      <div
        onClick={(e) => e.stopPropagation()} // 콘텐츠 클릭 시에는 닫히지 않도록 이벤트 전파를 막습니다.
        className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}