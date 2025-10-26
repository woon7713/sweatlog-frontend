import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Comments from "@/components/Comments";
import api from "@/api/axios";

// 카테고리 라벨
function catLabel(v) {
  switch (v) {
    case "WEIGHT_TRAINING":
      return "웨이트";
    case "YOGA":
      return "요가";
    case "CARDIO":
      return "유산소";
    case "PILATES":
      return "필라테스";
    default:
      return v ?? "";
  }
}

// HH:mm 포맷
function toHHmm(t) {
  if (!t) return "";
  if (typeof t === "string") {
    const m = t.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
    if (m) return `${m[1]}:${m[2]}`;
  }
  try {
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  } catch {}
  return String(t);
}
function headerDate(date, time) {
  const tt = toHHmm(time);
  return tt ? `${date ?? ""} ${tt}` : date ?? "";
}

export default function PostCard({ post }) {
  if (!post) return null;

  const navigate = useNavigate();

  // author/user 호환 + 안전 기본값
  const author = post.author ?? post.user ?? {};
  const nickname =
    author.nickname ?? author.fullName ?? author.username ?? "사용자";
  const avatarSrc =
    author.avatarUrl ??
    author.profileImageUrl ??
    (author.id
      ? `https://i.pravatar.cc/150?u=${author.id}`
      : "https://placehold.co/80x80");

  // 상태
  const [isLiked, setIsLiked] = useState(Boolean(post.liked));
  const [likeCount, setLikeCount] = useState(Number(post.likeCount ?? 0));
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(
    Number(post.commentCount ?? 0)
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const toggleLike = () => {
    setIsLiked((v) => !v);
    setLikeCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1));
  };

  const createdAt = headerDate(post.date, post.startTime);
  const pid = post.id ?? post.postId;

  // 이미지(서버가 /api/upload/profiles/... 같은 경로를 주는 것으로 가정)
  const imgUrl =
    post.imageUrl ??
    post.imageURL ??
    post.photoUrl ??
    post.image ??
    post.thumbnail ??
    null;

  async function handleDeletePost() {
    if (!pid) return alert("게시물 ID가 없어요.");
    if (!window.confirm("이 게시물을 삭제할까요?")) return;

    try {
      setRemoving(true);
      await api.delete(`/posts/${pid}`);
      setRemoved(true);
    } catch (e) {
      console.error("[post delete]", e);
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "삭제 실패";
      alert(`삭제 실패${status ? ` (HTTP ${status})` : ""}\n${msg}`);
    } finally {
      setRemoving(false);
      setMenuOpen(false);
    }
  }

  function handleEditPost() {
    if (!pid) return alert("게시물 ID가 없어요.");
    navigate("/post", { state: { edit: true, post } });
  }

  return (
    <article
      className="overflow-hidden rounded-lg bg-white shadow"
      onClick={() => setMenuOpen(false)}
    >
      {/* Header */}
      <div className="relative flex items-center gap-3 p-4">
        <img
          src={avatarSrc}
          alt={`${nickname} 프로필`}
          className="h-10 w-10 rounded-full object-cover"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/80x80")}
        />
        <div className="min-w-0">
          {author.id ? (
            <Link
              to={`/profile/${author.id}`}
              className="block truncate font-semibold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {nickname}
            </Link>
          ) : (
            <span className="block truncate font-semibold">{nickname}</span>
          )}
          <div className="text-sm text-gray-500">{createdAt}</div>
        </div>

        {/* 카테고리 뱃지 */}
        {post.category && (
          <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {catLabel(post.category)}
          </span>
        )}

        {/* ⋯ 더보기 메뉴 */}
        <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="게시물 메뉴"
            aria-haspopup="menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            disabled={removing}
            title="더보기"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-md border bg-white shadow-lg"
            >
              <button
                type="button"
                onClick={handleEditPost}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={removing}
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {removing ? "삭제 중…" : "삭제"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
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
