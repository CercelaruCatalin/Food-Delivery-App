"use client";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="
        animate-spin rounded-full
        border-4 border-primary border-t-transparent
        w-[clamp(3rem,8vw,6rem)] h-[clamp(3rem,8vw,6rem)]
        md:w-[clamp(4rem,10vw,8rem)] md:h-[clamp(4rem,10vw,8rem)]
        lg:w-[clamp(5rem,12vw,10rem)] lg:h-[clamp(5rem,12vw,10rem)]
      "></div>
    </div>
  );
}