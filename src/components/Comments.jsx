import React, { useEffect, useRef, useState } from "react";
import api from "@/api/axios";

// Spring Page<T> / 배열 호환
function toArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}

/** 서버 스펙: GET/POST /api/comments/posts/{postId}  ,  DELETE /api/comments/{commentId} */
async function fetchComments(postId, page = 0, size = 100) {
  const res = await api.get(`comments/posts/${postId}`, {
    params: { page, size },
  });
  return toArray(res.data);
}
async function createComment(postId, content) {
  const res = await api.post(`comments/posts/${postId}`, { content });
  return res.data; // CommentResponse
}
async function deleteCommentById(commentId) {
  // 백엔드가 204 No Content 반환
  return api.delete(`comments/${commentId}`);
}

// 댓글 id를 다양한 필드명에서 안전하게 추출
function getCommentId(c) {
  return c?.id ?? c?.commentId ?? c?.comment?.id ?? null;
}

export default function Comments({ postId, onCountChange, currentUserId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");

  // ⋯ 메뉴: 어느 댓글의 메뉴가 열려있는지
  const [menuFor, setMenuFor] = useState(null); // commentId 또는 인덱스
  const [deletingId, setDeletingId] = useState(null);

  // mount 시 로딩
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        setLoading(true);
        const items = await fetchComments(postId);
        setList(items);
      } catch (e) {
        console.error("[comments] fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  // 길이가 바뀌면 부모에 알려주기 (렌더 후)
  const prevLenRef = useRef(-1);
  useEffect(() => {
    if (prevLenRef.current !== list.length) {
      onCountChange?.(list.length);
      prevLenRef.current = list.length;
    }
  }, [list.length, onCountChange]);

  const canDelete = (c) => {
    if (!currentUserId) return true; // 필요 시 false로 바꾸면 내 댓글만 보이게 가능
    const u = c?.user ?? c?.author ?? {};
    return u?.id === currentUserId;
  };

  const authorName = (c) => {
    const u = c?.user ?? c?.author ?? {};
    return u?.nickname ?? u?.fullName ?? u?.username ?? "익명";
  };
  const timeText = (c) => {
    const raw = c?.createdAt ?? c?.createAt ?? c?.created_at ?? c?.time;
    if (!raw) return "";
    try {
      const d = typeof raw === "number" ? new Date(raw) : new Date(String(raw));
      return isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
    } catch {
      return String(raw);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const created = await createComment(postId, text.trim());
      setList((prev) => [...prev, created]); // 개수 반영은 useEffect에서
      setText("");
    } catch (e) {
      console.error("[comments] create error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "댓글 작성 실패";
      alert(msg);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(c) {
    const cid = getCommentId(c);
    if (!cid) {
      alert("댓글 ID를 찾을 수 없어요. (응답 필드명 확인 필요: id/commentId)");
      console.warn("[comments] missing id on comment:", c);
      return;
    }
    if (!window.confirm("댓글을 삭제하시겠어요?")) return;

    try {
      setDeletingId(cid);
      console.debug("[comments] DELETE /api/comments/" + cid);
      const res = await deleteCommentById(cid); // 204 예상
      console.debug("[comments] delete response:", res?.status);
      setList((prev) => prev.filter((x) => getCommentId(x) !== cid));
      setMenuFor(null);
    } catch (e) {
      console.error("[comments] delete error:", e);
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "댓글 삭제 실패";
      alert(`삭제 실패${status ? ` (HTTP ${status})` : ""}\n${msg}`);
    } finally {
      setDeletingId(null);
    }
  }

  const count = list.length;

  return (
    // ✅ 섹션 아무 데나 클릭하면 메뉴 닫힘
    <section
      className="border-t px-4 pb-4 pt-3"
      id={`comments-${postId}`}
      onClick={() => setMenuFor(null)}
    >
      {loading ? (
        <div className="py-3 text-sm text-gray-500">댓글 불러오는 중…</div>
      ) : count === 0 ? (
        <div className="py-3 text-sm text-gray-500">첫 댓글을 남겨보세요!</div>
      ) : (
        <ul className="space-y-3">
          {list.map((c, i) => {
            const cid = getCommentId(c) ?? i;
            const isDeleting = deletingId === getCommentId(c);
            return (
              <li
                key={cid}
                className="relative rounded-md bg-gray-50 px-3 py-2"
              >
                {/* 상단 행: 작성자(왼쪽) | 시간 + ⋯ (오른쪽 끝) */}
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {authorName(c)}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs text-gray-500">
                      {timeText(c)}
                    </span>

                    {canDelete(c) && (
                      // ✅ 메뉴 박스 안쪽 클릭은 상위 onClick으로 전파 막기
                      <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="댓글 메뉴"
                          aria-haspopup="menu"
                          onClick={() =>
                            setMenuFor((v) => (v === cid ? null : cid))
                          }
                          className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50"
                          title="메뉴"
                          disabled={isDeleting}
                        >
                          {/* vertical dots */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 text-gray-500"
                          >
                            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                          </svg>
                        </button>

                        {menuFor === cid && (
                          <div
                            role="menu"
                            className="absolute right-0 z-20 mt-1 w-28 overflow-hidden rounded-md border bg-white shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                              disabled={isDeleting}
                            >
                              {isDeleting ? "삭제 중…" : "삭제"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 본문 */}
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                  {c.content ?? c.text ?? ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          placeholder="댓글을 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {sending ? "작성 중…" : "작성"}
        </button>
      </form>
    </section>
  );
}
