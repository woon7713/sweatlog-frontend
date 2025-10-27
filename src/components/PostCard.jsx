// src/components/PostCard.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Comments from "@/components/Comments";
import FollowButton from "@/components/FollowButton";
import api from "@/api/axios";
import useAuthStore from "@/store/authStore";

function catLabel(v) { if(v==="WEIGHT_TRAINING")return "웨이트";if(v==="YOGA")return "요가";if(v==="CARDIO")return "유산소";if(v==="PILATES")return "필라테스";return v??""}
function toHHmm(t) { if(!t)return "";if(typeof t==="string"){const m=t.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);if(m)return `${m[1]}:${m[2]}`}try{const d=new Date(t);if(!isNaN(d.getTime()))return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:false})}catch{}return String(t)}
function headerDate(date, time) { const tt=toHHmm(time);return tt?`${date??""} ${tt}`:date??""}

export default function PostCard({ post }) {
  if (!post) return null;

  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const author = post.author ?? post.user ?? {};
  const nickname = author.nickname ?? author.fullName ?? author.username ?? "사용자";
  const avatarSrc = author.profileImageUrl ?? (author.id ? `https://i.pravatar.cc/150?u=${author.id}` : "https://placehold.co/80x80");
  const isMyPost = authUser?.id === author?.id;
  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
  const [likeCount, setLikeCount] = useState(Number(post.likeCount ?? 0));
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(Number(post.commentCount ?? 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState(false);

  if (removed) return null;
  const pid = post.id ?? post.postId;

  const toggleLike = async () => {
    if (isLikeProcessing || !pid) return;
    setIsLikeProcessing(true);
    const originalLiked = isLiked;
    const originalCount = likeCount;
    setIsLiked(!originalLiked);
    setLikeCount(originalLiked ? Math.max(0, originalCount - 1) : originalCount + 1);
    try {
      const response = await api.post(`/posts/${pid}/like`);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      setIsLiked(originalLiked);
      setLikeCount(originalCount);
      alert("좋아요 처리에 실패했습니다.");
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const createdAt = headerDate(post.date, post.startTime);
  const imgUrl = post.imageUrl ?? null;

  async function handleDeletePost() {
    setMenuOpen(false);
    if (!pid) return alert("게시물 ID가 없습니다.");
    if (!window.confirm("이 게시물을 정말 삭제하시겠습니까?")) return;
    setRemoving(true);
    try {
      await api.delete(`/posts/${pid}`);
      setRemoved(true);
    } catch (e) {
      console.error("게시물 삭제 실패:", e);
      alert(`삭제에 실패했습니다: ${e.response?.data?.message || e.message}`);
    } finally {
      setRemoving(false);
    }
  }

  function handleEditPost() {
    setMenuOpen(false);
    if (!pid) return alert("게시물 ID가 없습니다.");
    navigate("/post", { state: { edit: true, post } });
  }

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-sm" onClick={() => setMenuOpen(false)}>
      <div className="relative flex items-center gap-3 p-4">
        <Link to={`/profile/${author.id}`} onClick={(e) => e.stopPropagation()}>
          <img src={avatarSrc} alt={`${nickname} 프로필`} className="h-10 w-10 rounded-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/80x80")} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${author.id}`} className="truncate font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
              {nickname}
            </Link>
            {/* ✨ --- 여기가 팔로우 버튼 렌더링 부분입니다 --- ✨ */}
            {!isMyPost && (
              <>
                <span className="text-gray-400">·</span>
                <FollowButton targetUserId={author.id} />
              </>
            )}
            {/* ✨ --------------------------------------------- ✨ */}
          </div>
          <div className="text-sm text-gray-500">{createdAt}</div>
        </div>

        {post.category && (<span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{catLabel(post.category)}</span>)}

        {/* isMyPost가 false이므로 이 부분은 렌더링되지 않습니다 (정상) */}
        {isMyPost && (
          <div className="relative ml-auto" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="게시물 메뉴" onClick={() => setMenuOpen((v) => !v)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100" disabled={removing} title="더보기">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor"><path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" /></svg>
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-md border bg-white shadow-lg">
                <button type="button" onClick={handleEditPost} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">수정</button>
                <button type="button" onClick={handleDeletePost} disabled={removing} className="block w-full px-4 py-2 text-left text-sm text-brand-red hover:bg-red-50 disabled:opacity-50">{removing ? "삭제 중…" : "삭제"}</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 px-4 pb-4">
        {post.title && <h2 className="text-lg font-semibold">{post.title}</h2>}
        {post.memo && (
          <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
            {post.memo}
          </p>
        )}

        {imgUrl && (
          <Link
            to={`/post/${pid ?? ""}`}
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imgUrl}
              alt={`Post by ${nickname}`}
              className="max-h-[520px] w-full rounded-md object-cover"
              loading="lazy"
            />
          </Link>
        )}

        {/* 운동 상세 */}
        {Array.isArray(post.details) && post.details.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">운동</th>
                  <th className="px-3 py-2">무게</th>
                  <th className="px-3 py-2">횟수</th>
                  <th className="px-3 py-2">세트</th>
                  {"duration" in (post.details?.[0] ?? {}) && (
                    <th className="px-3 py-2">시간(분)</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {post.details.map((d, i) => (
                  <tr key={`${pid ?? "p"}-detail-${i}`} className="border-t">
                    <td className="px-3 py-2">{d.name ?? "-"}</td>
                    <td className="px-3 py-2">{d.weight ?? "-"}</td>
                    <td className="px-3 py-2">{d.reps ?? "-"}</td>
                    <td className="px-3 py-2">{d.sets ?? "-"}</td>
                    {"duration" in d && (
                      <td className="px-3 py-2">{d.duration ?? "-"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 푸터: HH:mm ~ HH:mm */}
      <div className="flex items-center gap-6 border-t px-4 py-3 text-sm">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-2 ${
            isLiked ? "text-rose-600" : "text-gray-700"
          } hover:opacity-80`}
        >
          <span aria-hidden>❤️</span>
          <span>{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          aria-controls={pid ? `comments-${pid}` : undefined}
          className="flex items-center gap-2 text-gray-700 hover:opacity-80"
        >
          <span aria-hidden>💬</span>
          <span>{commentCount}</span>
        </button>

        {post.endTime && (
          <div className="ml-auto text-gray-500">
            {toHHmm(post.startTime)} ~ {toHHmm(post.endTime)}
          </div>
        )}
      </div>

      {/* 댓글 */}
      {showComments && pid && (
        <Comments postId={pid} onCountChange={setCommentCount} />
      )}
    </article>
  );
}