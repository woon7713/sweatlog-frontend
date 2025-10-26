import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { searchPosts } from "../api/searchApi";

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// 간단 LRU 대용: 최근 50개 쿼리 캐시
const cache = new Map(); // key: `${q}|${mode}|${page}|${size}` -> {items,total,hasNext}

export function useSearch({
  initialQuery = "",
  initialMode = "PRIMARY_CONTAINS",
  pageSize = 10,
}) {
  const [q, setQ] = useState(initialQuery);
  const [mode, setMode] = useState(initialMode);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState("idle"); // idle|loading|error|success
  const [error, setError] = useState(null);

  const debouncedQ = useDebouncedValue(q, 300);
  const controllerRef = useRef(null);
  const size = pageSize;

  const key = useMemo(
    () => `${debouncedQ}|${mode}|${page}|${size}`,
    [debouncedQ, mode, page, size]
  );

  const run = useCallback(async () => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    // 빈 쿼리는 초기화(렌더/네트워크 낭비 방지)
    if (!debouncedQ?.trim()) {
      setItems([]);
      setTotal(0);
      setHasNext(false);
      setStatus("idle");
      setError(null);
      return;
    }

    // 캐시 히트
    if (cache.has(key)) {
      const cached = cache.get(key);
      setItems((prev) => (page === 0 ? cached.items : prev)); // 안전: 첫 페이지일 때만 전체 교체
      setTotal(cached.total);
      setHasNext(cached.hasNext);
      setStatus("success");
      setError(null);
      return;
    }

    try {
      setStatus(page === 0 ? "loading" : "success"); // 더보기 중이면 스피너만 하단에
      const data = await searchPosts({
        keyword: debouncedQ.trim(),
        mode,
        page,
        size,
        signal,
      });
      cache.set(key, data);
      // LRU 정리
      if (cache.size > 50) cache.delete(cache.keys().next().value);

      setTotal(data.total);
      setHasNext(data.hasNext);
      setStatus("success");
      setError(null);

      if (page === 0) setItems(data.items);
      else setItems((prev) => [...prev, ...data.items]);
    } catch (e) {
      if (e.name === "AbortError") return;
      setStatus("error");
      setError(e);
    }
  }, [debouncedQ, mode, page, size, key]);

  // q/mode 변경 시 페이지 리셋
  useEffect(() => {
    setPage(0);
  }, [debouncedQ, mode]);

  // 실행
  useEffect(() => {
    run();
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [run]);

  const fetchMore = useCallback(() => {
    if (status !== "loading" && hasNext) setPage((p) => p + 1);
  }, [status, hasNext]);

  return {
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
  };
}
