// src/pages/SocialFeed.jsx
import React, { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import api from "@/api/axios";
import useAuthStore from "@/store/authStore";

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: me, setFollowing } = useAuthStore();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        console.log("--- 🔄 SocialFeed 데이터 로드 시작 ---");
        const [postsRes, followingRes] = await Promise.all([
          api.get("/posts?page=0&size=20"),
          me?.id ? api.get(`/users/${me.id}/following`, { params: { size: 2000 }}) : Promise.resolve({ data: { content: [] } })
        ]);

        console.log("📥 받아온 게시물 데이터:", postsRes.data); // 진단 로그
        console.log("📥 받아온 팔로잉 데이터:", followingRes.data); // 진단 로그

        const normalizedPosts = (postsRes.data?.content || []).map(p => {
            const user = p.user || p.author || {};
            return { ...p, author: user };
        });

        setPosts(normalizedPosts);
        
        const followingIds = (followingRes.data?.content || []).map(user => user.id);
        setFollowing(followingIds);

      } catch (e) {
        console.error("피드 로딩 에러:", e);
      } finally {
        setLoading(false);
        console.log("--- ✅ SocialFeed 데이터 로드 완료 ---");
      }
    };
    
    loadInitialData();
  }, [me, setFollowing]);

  if (loading) { /* ... */ }

  return (
    <div className="container mx-auto max-w-xl space-y-6 p-4">
      <h1 className="text-3xl font-bold">피드</h1>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}