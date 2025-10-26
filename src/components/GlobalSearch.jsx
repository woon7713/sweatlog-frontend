import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/axios";

// 초성만 입력 중이면(ㄱㄴㄷㄹ...) 백엔드 아직 못 받으니까 그동안은 추천 안 날림
const isChoseongOnly = (s) => /^[\u3131-\u314E]+$/.test(s || "");

// 디바운스 훅
const useDebounced = (value, delay = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export default function GlobalSearch({ compact = false }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const loc = useLocation();

  // 한글 IME 조합 중일 때(초성만 잠깐 나올 때)는 서버 호출 안 하려고 따로 추적
  const composingRef = useRef(false);

  // /search 라우트에 있을 땐 URL의 ?q로 입력창 채워주기
  useEffect(() => {
    if (loc.pathname === "/search") {
      const sp = new URLSearchParams(loc.search);
      setQ(sp.get("q") || "");
    }
  }, [loc.pathname, loc.search]);

  const debouncedQ = useDebounced(q, 250);

  // 자동완성 (백엔드 AUTOCOMPLETE만 호출)
  useEffect(() => {
    const keyword = (debouncedQ || "").trim();

    // 조건: 글자 없음 / 조합중 / 초성만 => 자동완성 끔
    if (!keyword || composingRef.current || isChoseongOnly(keyword)) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await api.get("/search/posts", {
          params: {
            keyword,
            mode: "AUTOCOMPLETE",
            page: 0,
            size: 5,
          },
        });

        const list = Array.isArray(r.data?.content)
          ? r.data.content
          : Array.isArray(r.data)
          ? r.data
          : [];

        const words = [
          ...new Set(list.map((p) => p.title ?? p.postTitle).filter(Boolean)),
        ].slice(0, 5);

        if (!alive) return;
        setSuggestions(words);
        setOpen(words.length > 0);
      } catch {
        if (!alive) return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [debouncedQ]);

  const submitSearch = (value) => {
    const v = (value ?? q).trim();
    if (!v) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(v)}`);
  };

  return (
    <div className={compact ? "relative w-64" : "relative w-full max-w-xl"}>
      <form
        role="search"
        aria-label="global search"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)} // blur로 드롭다운 바로 사라지지 않게 살짝 지연
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          placeholder="검색어를 입력하세요..."
          aria-label="검색어"
          className="w-full px-3 py-2 rounded-xl border outline-none"
        />

        <button
          type="submit"
          aria-label="검색"
          className="px-3 py-2 rounded-xl border"
          title="검색"
        >
          {/* 돋보기 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border bg-white shadow">
          {suggestions.map((s, i) => (
            <li key={s + "-" + i}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()} // blur 방지
                onClick={() => submitSearch(s)}
              >
                {s}
              </button>
            </li>
          ))}
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-500">불러오는 중…</li>
          )}
        </ul>
      )}
    </div>
  );
}
