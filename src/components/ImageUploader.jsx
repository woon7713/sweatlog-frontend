import React, { useRef, useState } from "react";
import api from "@/api/axios";

/**
 * 서버: POST /api/upload/image  -> { imageUrl: string }
 * imageUrl은 절대 URL / "/api/..." / "파일명" 중 무엇이든 가능 (표시는 PostCard가 정규화)
 */
export default function ImageUploader({
  onUploadSuccess,
  uploadContext = "post",
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // 업로드
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", uploadContext);

    setIsUploading(true);
    try {
      const { data } = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // 콜백에 문자열 URL만 넘김
      onUploadSuccess?.(data?.imageUrl ?? data?.url ?? "");
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드에 실패했습니다.");
      setImagePreview(null);
      fileInputRef.current && (fileInputRef.current.value = "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImagePreview(null);
    onUploadSuccess?.("");
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  return (
    <div className="w-full rounded-lg border-2 border-dashed bg-gray-50 p-4 text-center">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {imagePreview ? (
        <div className="relative group">
          <img
            src={imagePreview}
            alt="이미지 미리보기"
            className="w-full rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-black shadow group-hover:flex"
            title="이미지 제거"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-32 w-full flex-col items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600 disabled:opacity-60"
        >
          {isUploading ? (
            <span>업로드 중…</span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="mt-2 font-semibold">인증샷 추가하기</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
