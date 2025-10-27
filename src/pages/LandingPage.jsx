import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Dumbbell, Target, Users } from "lucide-react";

// 각 슬라이드의 이미지, 내용을 배열로 관리합니다.
// ✅ 이 부분을 복사해서 기존 slides 배열과 교체하세요.

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80",
    content: (
      <>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          당신의 모든 땀방울을
          <br />
          <span className="font-oswald font-bold tracking-tight">
            <span className="text-white">SweatLo</span>
            <span className="text-purple-500">g</span>
          </span>
          에 기록하세요.
        </h1>
      </>
    ),
  },
  {
    image:
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1200&q=80",
    content: (
      <>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          기록하는 순간,
          <br />
          변화는 시작됩니다.
        </h1>
      </>
    ),
  },
  {
    image:
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=1200&q=80",
    content: (
      <>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-16">
          어제의 나를 넘어,<br /> 더 나은 당신을 위해
          <r />
        </h1>
        {/* ✅ 그 아래에 기능 3가지 소개 배치 */}
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
          <div className="relative pl-16 text-left">
            <dt className="text-lg font-semibold leading-7 text-white">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              간편한 기록
            </dt>
            <dd className="mt-2 text-base leading-7 text-gray-300">
              어떤 운동이든 몇 번의 클릭으로 손쉽게 기록하고 관리하세요.
            </dd>
          </div>
          <div className="relative pl-16 text-left">
            <dt className="text-lg font-semibold leading-7 text-white">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Target className="h-6 w-6 text-white" />
              </div>
              똑똑한 목표 관리
            </dt>
            <dd className="mt-2 text-base leading-7 text-gray-300">
              구체적인 목표를 설정하고 달성률을 추적하며 운동 습관을
              만들어가세요.
            </dd>
          </div>
          <div className="relative pl-16 text-left">
            <dt className="text-lg font-semibold leading-7 text-white">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              함께하는 동기 부여
            </dt>
            <dd className="mt-2 text-base leading-7 text-gray-300">
              운동 기록을 공유하고 서로 응원하며 지치지 않는 열정을 충전하세요.
            </dd>
          </div>
        </dl>
      </>
    ),
  },
  {
    image:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1200&q=80",
    content: (
      <>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          오늘부터, 당신의 노력을
          <br />
          의미있는 데이터로 바꿔보세요.
        </h1>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/login"
            className="rounded-md bg-brand-primary px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-purple-700 focus-visible:outline-red-600 transition-transform hover:scale-105"
          >
            지금 바로 시작하기
          </Link>
        </div>
      </>
    ),
  },
];


export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? prev : prev + 1));
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden -mt-20 bg-black">
      {/* 슬라이드 래퍼 */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* 각 슬라이드 */}
        {slides.map((slide, index) => (
          <div key={index} className="relative h-full w-full flex-shrink-0">
            <img
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="relative mx-auto flex h-full max-w-4xl items-center justify-center px-6 text-center lg:px-8">
              <div className="transition-opacity duration-500">
                {slide.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 이전 버튼 */}
      {currentSlide > 0 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
          aria-label="Previous slide"
        >
          <ArrowLeft size={24} />
        </button>
      )}

      {/* 다음 버튼 */}
      {currentSlide < slides.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
          aria-label="Next slide"
        >
          <ArrowRight size={24} />
        </button>
      )}

      {/* 하단 페이지네이션 점 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              currentSlide === index ? "w-4 bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}