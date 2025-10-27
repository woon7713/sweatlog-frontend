// src/components/ProfileEditModal.jsx
import React from "react"; // ✨ useEffect, useState 제거
import Modal from "./Modal";

// 백엔드 Enum 값에 맞춘 옵션들
const experienceLevels = [
  { value: "NEWBIE", label: "입문" },
  { value: "BEGINNER", label: "초급" },
  { value: "INTERMEDIATE", label: "중급" },
  { value: "ADVANCED", label: "고급" },
];
const activityLevels = [
  { value: "NONE", label: "거의 안 함" },
  { value: "LIGHT", label: "가볍게 (주 1-2회)" },
  { value: "NORMAL", label: "보통 (주 3-4회)" },
  { value: "ACTIVE", label: "활동적 (주 5-6회)" },
  { value: "INTENSE", label: "매우 활동적 (매일)" },
];
const genders = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export default function ProfileEditModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitting,
}) {
  // ✨ handleChange 함수도 부모의 setFormData를 직접 사용하도록 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✨ 부모로부터 받은 onSubmit 함수를 그대로 호출
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  if (!isOpen) return null;

  // ✨ formData가 없을 경우를 대비한 방어 코드
  if (!formData)
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div>로딩 중...</div>
      </Modal>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[80vh] overflow-y-auto p-1"
      >
        <h2 className="text-xl font-bold">프로필 수정</h2>

        {/* 모든 input의 value는 부모로부터 받은 formData를 사용 */}
        <fieldset className="space-y-2">
          <legend className="font-semibold text-gray-600 text-sm">
            기본 정보
          </legend>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              이름
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium">
              자기소개
            </label>
            <textarea
              name="bio"
              rows="3"
              value={formData.bio || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-semibold text-gray-600 text-sm">
            신체 정보
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium">
                성별
              </label>
              <select
                name="gender"
                value={formData.gender || "MALE"}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                {genders.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium">
                생년월일
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="heightCm" className="block text-sm font-medium">
                키 (cm)
              </label>
              <input
                type="number"
                name="heightCm"
                value={formData.heightCm || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300"
                max="299"
              />
            </div>
            <div>
              <label htmlFor="weightKg" className="block text-sm font-medium">
                몸무게 (kg)
              </label>
              <input
                type="number"
                name="weightKg"
                value={formData.weightKg || ""}
                onChange={handleChange}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300"
                max="999.9"
              />
            </div>
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="font-semibold text-gray-600 text-sm">
            운동 정보
          </legend>
          <div>
            <label
              htmlFor="experienceLevel"
              className="block text-sm font-medium"
            >
              운동 경력
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel || "NEWBIE"}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              {experienceLevels.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="activityLevel"
              className="block text-sm font-medium"
            >
              활동 수준
            </label>
            <select
              name="activityLevel"
              value={formData.activityLevel || "NONE"}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              {activityLevels.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <div className="text-right pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-brand-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
