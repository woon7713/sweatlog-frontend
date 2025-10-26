// src/pages/MyPosts.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import useAuthStore from '@/store/authStore';
import { PlusCircle } from 'lucide-react';

export default function MyPosts() {
  const { user: authUser } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      return;
    }
    const fetchMyPosts = async () => {
      setLoading(true);
      try {
        // 내 ID로 게시물을 조회합니다. size를 크게 주어 모든 게시물을 가져오도록 합니다.
        const response = await api.get(`/posts/user/${authUser.id}`, {
          params: { page: 0, size: 100 } 
        });
        setPosts(response.data?.content || []);
      } catch (error) {
        console.error("내 게시물 로드 실패:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, [authUser]);

  if (loading) return <div className="p-6 text-center">나의 기록을 불러오는 중...</div>;

  return (
    <div className="container mx-auto max-w-4xl p-4">
      {/* ✨ --- 이 부분을 수정합니다 --- ✨ */}
      <div className="flex justify-end items-center mb-6">
        {/* <h1>나의 운동 기록</h1> 제목을 삭제합니다. */}
        <Link to="/post" className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-red-dark">
          <PlusCircle size={20} /> 새 기록 추가
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
          {posts.map(post => (
            <Link to={`/post/${post.id}`} key={post.id} className="relative group aspect-square">
              <img 
                src={post.imageUrl || 'https://placehold.co/300x300/e2e8f0/e2e8f0?text=No+Image'} 
                alt={post.title || '운동 기록'} 
                className="w-full h-full object-cover bg-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100 p-2">
                <div className="text-center">
                  <p className="font-semibold text-sm truncate">{post.title || '제목 없음'}</p>
                  <p className="text-xs">{post.date}</p>
                  <div className="mt-2 text-xs">
                    <span>❤️ {post.likeCount || 0}</span>
                    <span className="ml-2">💬 {post.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">아직 작성한 운동 기록이 없습니다.</p>
          <p className="mt-2">첫 번째 운동 기록을 남겨보세요!</p>
        </div>
      )}
    </div>
  );
}