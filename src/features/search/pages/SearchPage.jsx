import { useEffect } from "react";
import SearchBox from "../components/SearchBox.jsx";
import { useSearch } from "../hooks/useSearch.js";

function Highlight({ text, q }) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

function PostCard({ post, q }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm opacity-60">
        {post.category} · {post.date}
      </div>
      <div className="text-lg font-semibold mt-1">
        <Highlight text={post.title || "(제목 없음)"} q={q} />
      </div>
      {post.memo && (
        <div className="text-sm mt-1 line-clamp-2">{post.memo}</div>
      )}
      <div className="text-xs mt-2 opacity-60">
        👍 {post.likeCount} · 💬 {post.commentCount}
      </div>
    </div>
  );
}

export default function SearchPage() {
  // URL의 ?q 동기화 (딮링크로 진입했을 때)
  const sp = new URLSearchParams(window.location.search);
  const initialQ = sp.get("q") || "";

  const {
    q,
    setQ,
    mode,
    setMode,
    items,
    total,
    hasNext,
    status,
    error,
    fetchMore,
  } = useSearch({ initialQuery: initialQ });

  // 무한 스크롤 옵저버
  useEffect(() => {
    const sentinel = document.getElementById("search-more-sentinel");
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) fetchMore();
        });
      },
      { rootMargin: "200px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [fetchMore, items.length, hasNext]);

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 w-full max-w-2xl">검색</h1>
      <SearchBox
        value={q}
        onChange={setQ}
        mode={mode}
        onModeChange={setMode}
        onSubmit={() => {}}
      />

      {/* 상태 영역 */}
      {status === "idle" && !q && (
        <div className="mt-10 opacity-60">검색어를 입력해 시작하세요.</div>
      )}
      {status === "loading" && (
        <div className="mt-6 w-full max-w-2xl">
          <div className="animate-pulse h-20 rounded-2xl border mb-3" />
          <div className="animate-pulse h-20 rounded-2xl border mb-3" />
        </div>
      )}
      {status === "error" && (
        <div className="mt-6 text-red-600">검색 중 오류: {error?.message}</div>
      )}

      {/* 결과 */}
      {(status === "success" || items.length > 0) && q && (
        <div className="w-full max-w-2xl mt-6">
          <div className="text-sm mb-2 opacity-60">총 {total}개 결과</div>
          <div className="grid gap-3">
            {items.map((p) => (
              <PostCard key={p.id} post={p} q={q} />
            ))}
          </div>
          <div id="search-more-sentinel" className="h-8" />
          {!hasNext && items.length > 0 && (
            <div className="text-center text-sm opacity-60 my-4">
              끝까지 봤어요 👀
            </div>
          )}
          {q && items.length === 0 && status === "success" && (
            <div className="mt-10 opacity-60">결과가 없어요.</div>
          )}
        </div>
      )}
    </div>
  );
}
