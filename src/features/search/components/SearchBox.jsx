import { useEffect, useRef } from "react";

export default function SearchBox({
  value,
  onChange,
  mode,
  onModeChange,
  onSubmit,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    // /search?q=... 동기화 (새로고침 공유)
    const sp = new URLSearchParams(window.location.search);
    if (value) sp.set("q", value);
    else sp.delete("q");
    const newUrl = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [value]);

  return (
    <form
      role="search"
      aria-label="post search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="flex gap-2 items-center w-full max-w-2xl"
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="검색어를 입력하세요…"
        aria-label="검색어"
        className="w-full px-3 py-2 rounded-xl border outline-none"
      />
      <select
        aria-label="검색 모드"
        value={mode}
        onChange={(e) => onModeChange(e.target.value)}
        className="px-3 py-2 rounded-xl border"
      >
        <option value="PRIMARY_CONTAINS">포함</option>
        <option value="PRIMARY_PREFIX">시작 일치</option>
        <option value="EXACT">완전 일치</option>
      </select>
      <button type="submit" className="px-4 py-2 rounded-xl border">
        검색
      </button>
    </form>
  );
}
