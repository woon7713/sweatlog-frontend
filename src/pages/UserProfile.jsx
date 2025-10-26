// src/pages/UserProfile.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/axios";
import FollowButton from "@/components/FollowButton";
import FollowListModal from "@/components/FollowListModal";
import useAuthStore from "@/store/authStore";

export default function UserProfile() {
  const { userId } = useParams();
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followInfo, setFollowInfo] = useState({ followersCount: 0, followingCount: 0 });
  const [modalState, setModalState] = useState({ isOpen: false, type: 'followers' });
  const [loading, setLoading] = useState(true);

  // 현재 보고 있는 프로필이 내 프로필인지 확인
  const isMyProfile = authUser?.id === Number(userId);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      // User 정보, Post 정보, Follow 정보를 병렬로 가져옵니다.
      const [allUsersRes, postsRes, followStatusRes] = await Promise.all([
        api.get('/users', { params: { size: 1000 } }), // 전체 유저 목록에서 찾기 (임시)
        api.get(`/posts/user/${userId}`),
        api.get(`/users/${userId}/follow-status`),
      ]);
      
      const userList = allUsersRes.data?.content || [];
      const foundUser = userList.find(u => u.id === Number(userId));

      setProfile(foundUser);
      setPosts(postsRes.data?.content || []);
      setFollowInfo(followStatusRes.data);
      
    } catch (err) {
      console.error("프로필 로드 실패", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [userId]); // ✨ userId가 바뀔 때마다 데이터를 다시 로드

  const openModal = (type) => setModalState({ isOpen: true, type });
  const closeModal = () => setModalState({ isOpen: false, type: 'followers' });

  if (loading) return <div className="p-6 text-center">프로필을 불러오는 중...</div>;
  if (!profile) return <div className="p-6 text-center">사용자를 찾을 수 없습니다.</div>;

  const avatar = profile.profileImageUrl || `https://i.pravatar.cc/150?u=${profile.id}`;

  return (
    <div className="container mx-auto max-w-3xl p-4 space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <img src={avatar} alt="프로필" className="h-24 w-24 rounded-full object-cover bg-gray-200" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{profile.fullName || profile.username}</h1>
              {/* 내 프로필이면 /profile (MyProfile)로 가는 링크, 남의 프로필이면 팔로우 버튼 */}
              {isMyProfile ? (
                <Link to="/profile" className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-gray-50">내 프로필 관리</Link>
              ) : (
                <FollowButton targetUserId={userId} />
              )}
            </div>
            <div className="mt-2 flex gap-6 text-sm">
              <span className="text-center font-semibold">{posts.length}<br/><span className="font-normal text-gray-500">게시물</span></span>
              <button onClick={() => openModal('followers')} className="text-center hover:underline">
                <span className="font-semibold">{followInfo.followersCount}</span><br/><span className="font-normal text-gray-500">팔로워</span>
              </button>
              <button onClick={() => openModal('following')} className="text-center hover:underline">
                <span className="font-semibold">{followInfo.followingCount}</span><br/><span className="font-normal text-gray-500">팔로잉</span>
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-700">{profile.bio || "자기소개가 없습니다."}</p>
          </div>
        </div>
      </div>

      {/* ✨ 해당 유저의 게시물 목록을 그리드로 표시 */}
      <div className="grid grid-cols-3 gap-1">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link to={`/post/${post.id}`} key={post.id} className="relative group aspect-square">
              <img src={post.imageUrl || 'https://placehold.co/300x300/e2e8f0/e2e8f0'} alt={post.title} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                <span>❤️ {post.likeCount || 0} 💬 {post.commentCount || 0}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">아직 작성한 게시물이 없습니다.</p>
          </div>
        )}
      </div>

      <FollowListModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        userId={userId}
        type={modalState.type}
      />
    </div>
  );
}