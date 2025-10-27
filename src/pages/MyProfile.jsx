// src/pages/MyProfile.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import ProfileEditModal from "@/components/ProfileEditModal";
import FollowListModal from "@/components/FollowListModal";
import useAuthStore from "@/store/authStore";
import { Edit, BarChart2 } from "lucide-react";

const LABELS = {
  experienceLevel: {
    NEWBIE: "입문",
    BEGINNER: "초급",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
  },
  activityLevel: {
    NONE: "거의 안 함",
    LIGHT: "가볍게 (주 1-2회)",
    NORMAL: "보통 (주 3-4회)",
    ACTIVE: "활동적 (주 5-6회)",
    INTENSE: "매우 활동적 (매일)",
  },
  gender: { MALE: "남성", FEMALE: "여성" },
};

export default function MyProfile() {
  // 1. profile 상태를 제거하고, authUser를 모든 정보의 기준으로 삼습니다.
  const { user: authUser, login, accessToken } = useAuthStore();

  const [followInfo, setFollowInfo] = useState({
    followersCount: 0,
    followingCount: 0,
  });
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState({
    isOpen: false,
    type: "followers",
  });
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // 2. 서버에서는 팔로워, 게시물 수 같은 '추가' 정보만 불러옵니다.
  const loadExtraData = useCallback(async () => {
    if (!authUser?.id) {
      setLoading(false);
      return;
    }
    try {
      const [followStatusRes, postsRes] = await Promise.all([
        api.get(`/users/${authUser.id}/follow-status`),
        api.get(`/posts/user/${authUser.id}`, { params: { size: 1 } }),
      ]);
      setFollowInfo(followStatusRes.data);
      setPostCount(postsRes.data?.totalElements || 0);
    } catch (err) {
      console.error("추가 데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    setLoading(true);
    loadExtraData();
  }, [loadExtraData]);

  const openEditModal = () => {
    setEditingProfile({ ...authUser }); // 수정 창을 열 때, authUser의 현재 정보를 복사
    setIsEditModalOpen(true);
  };

  // 3. '저장' 버튼을 누르면, 서버 DB를 업데이트하고, 성공하면 authUser 상태를 직접 업데이트합니다.
  const handleProfileSubmit = async () => {
    if (!editingProfile?.fullName?.trim()) {
      return alert("이름은 필수 항목입니다.");
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...editingProfile,
        heightCm: editingProfile.heightCm
          ? parseInt(editingProfile.heightCm, 10)
          : null,
        weightKg: editingProfile.weightKg
          ? Number(editingProfile.weightKg)
          : null,
        experienceLevel: editingProfile.experienceLevel || "NEWBIE",
        activityLevel: editingProfile.activityLevel || "NONE",
        preferredWorkoutIds:
          editingProfile.preferredWorkoutIds &&
          editingProfile.preferredWorkoutIds.length > 0
            ? editingProfile.preferredWorkoutIds
            : [1],
      };

      await api.put("/users/profile/setting", payload);

      login(editingProfile, accessToken);

      alert("프로필이 수정되었습니다.");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("프로필 수정 실패:", error.response?.data || error);
      alert(error.response?.data?.message || "프로필 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = uploadRes.data.imageUrl;
      const currentProfileData = authUser || {};
      const payload = {
        ...currentProfileData,
        profileImageUrl: imageUrl,
        experienceLevel: currentProfileData.experienceLevel || "NEWBIE",
        activityLevel: currentProfileData.activityLevel || "NONE",
        preferredWorkoutIds: currentProfileData.preferredWorkoutIds || [1],
      };
      await api.put("/users/profile/setting", payload);

      // 사진 변경 성공 시에도 authUser 상태를 직접 업데이트
      login({ ...authUser, profileImageUrl: imageUrl }, accessToken);

      alert("프로필 사진이 변경되었습니다.");
    } catch (err) {
      console.error("프로필 사진 변경 실패:", err);
      alert("사진 변경에 실패했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openFollowModal = (type) =>
    setIsFollowModalOpen({ isOpen: true, type });
  const closeFollowModal = () =>
    setIsFollowModalOpen({ isOpen: false, type: "followers" });

  if (loading)
    return <div className="p-6 text-center">프로필을 불러오는 중...</div>;
  if (!authUser)
    return <div className="p-6 text-center">로그인 정보가 없습니다.</div>;

  // 4. 화면의 모든 부분에서 profile 대신 authUser를 사용합니다.
  return (
    <div className="container mx-auto max-w-3xl p-4 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">내 프로필</h1>
        <button
          onClick={openEditModal}
          className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-100"
        >
          <Edit size={16} /> 프로필 수정
        </button>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <img
              src={
                authUser.profileImageUrl ||
                `https://i.pravatar.cc/150?u=${authUser.id}`
              }
              alt="프로필"
              className="h-24 w-24 rounded-full object-cover bg-gray-200"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              {isUploading ? "업로드중..." : "변경"}
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {authUser.fullName || authUser.username}
            </h2>
            <div className="mt-3 flex gap-6 text-sm">
              <Link to="/my-posts" className="text-center hover:underline">
                <span className="font-semibold">{postCount}</span>
                <br />
                <span className="font-normal text-gray-500">게시물</span>
              </Link>
              <button
                onClick={() => openFollowModal("followers")}
                className="text-center hover:underline"
              >
                <span className="font-semibold">
                  {followInfo.followersCount}
                </span>
                <br />
                <span className="font-normal text-gray-500">팔로워</span>
              </button>
              <button
                onClick={() => openFollowModal("following")}
                className="text-center hover:underline"
              >
                <span className="font-semibold">
                  {followInfo.followingCount}
                </span>
                <br />
                <span className="font-normal text-gray-500">팔로잉</span>
              </button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-700 border-t pt-4">
          {authUser.bio || "자기소개를 입력해주세요."}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart2 size={20} /> 나의 운동 통계
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>(추후 이 곳에 운동 기록을 분석한 차트가 표시될 예정입니다)</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">상세 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-500">키</span>
            <span className="font-medium">
              {authUser.heightCm ? `${authUser.heightCm} cm` : "미입력"}
            </span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-500">몸무게</span>
            <span className="font-medium">
              {authUser.weightKg ? `${authUser.weightKg} kg` : "미입력"}
            </span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-500">성별</span>
            <span className="font-medium">
              {authUser.gender ? LABELS.gender[authUser.gender] : "미입력"}
            </span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-500">생년월일</span>
            <span className="font-medium">
              {authUser.birthDate || "미입력"}
            </span>
          </div>
          <div className="flex justify-between border-b py-2 sm:col-span-2">
            <span className="text-gray-500">운동 경력</span>
            <span className="font-medium">
              {authUser.experienceLevel
                ? LABELS.experienceLevel[authUser.experienceLevel]
                : "미입력"}
            </span>
          </div>
          <div className="flex justify-between border-b py-2 sm:col-span-2">
            <span className="text-gray-500">활동 수준</span>
            <span className="font-medium">
              {authUser.activityLevel
                ? LABELS.activityLevel[authUser.activityLevel]
                : "미입력"}
            </span>
          </div>
        </div>
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={editingProfile}
        setFormData={setEditingProfile}
        onSubmit={handleProfileSubmit}
        submitting={isSubmitting}
      />
      <FollowListModal
        isOpen={isFollowModalOpen.isOpen}
        onClose={closeFollowModal}
        userId={authUser?.id}
        type={isFollowModalOpen.type}
      />
    </div>
  );
}
