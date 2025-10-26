import api from "@/api/axios";
// 위 경로는 너 FE의 axios 인스턴스 경로에 맞춰.
// 다른 FE에서 api 인스턴스 이름이 다르면 그걸 import하면 됨.

function mapModeForBE(mode) {
  if (mode === "PRIMARY_PREFIX") return "AUTOCOMPLETE";
  if (mode === "EXACT") return "PRIMARY_CONTAINS";
  return mode; // PRIMARY_CONTAINS, EXTENDED_CONTAINS 그대로
}

export async function searchPosts({
  keyword,
  mode = "PRIMARY_CONTAINS",
  page = 0,
  size = 10,
}) {
  const kw = (keyword ?? "").trim();
  const feMode = mode;
  const beMode = mapModeForBE(mode);

  const res = await api.get("/search/posts", {
    params: { keyword: kw, mode: beMode, page, size },
  });

  const data = res.data;
  const list = Array.isArray(data?.content)
    ? data.content
    : Array.isArray(data)
    ? data
    : [];

  let items = list.map((p) => ({
    id: p.id ?? p.postId ?? Math.random().toString(36).slice(2),
    title: p.title ?? p.postTitle ?? "",
    date: p.date,
    startTime: p.startTime,
    endTime: p.endTime,
    category: p.category,
    user: p.user,
    memo: p.memo,
    imageUrl: p.imageUrl,
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
  }));

  if (feMode === "EXACT") {
    const lc = kw.toLowerCase();
    items = items.filter((p) => (p.title || "").toLowerCase() === lc);
  }

  const total =
    feMode === "EXACT" ? items.length : data?.totalElements ?? items.length;
  const hasNext = feMode === "EXACT" ? false : data?.last === false;

  return { items, total, hasNext, page };
}
