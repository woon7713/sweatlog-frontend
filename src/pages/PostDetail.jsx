import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "@/api/axios";
import Comments from "@/components/Comments";

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export default function PostDetail() {
  const { postId } = useParams();
  const { state } = useLocation();
  const [post, setPost] = useState(state || null);
  const [loading, setLoading] = useState(!state);

  useEffect(() => {
    if (state) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/posts", { params: { page: 0, size: 100 } });
        const arr = toArray(res.data);
        const found = arr.find((p) => String(p.id) === String(postId));
        if (found) setPost(found);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, state]);

  if (loading) return <div className="p-6 text-center">불러오는 중...</div>;
  if (!post)
    return <div className="p-6 text-center">게시물을 찾을 수 없어요.</div>;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-1 text-2xl font-bold">{post.title}</h1>
      <div className="mb-4 text-gray-500">
        {post.category} · {post.date}{" "}
        {post.startTime && `· ${post.startTime}~${post.endTime}`}
      </div>
      {post.memo && <p className="mb-6 whitespace-pre-wrap">{post.memo}</p>}

      {/* 댓글 */}
      <Comments postId={postId} />
    </div>
  );
}
