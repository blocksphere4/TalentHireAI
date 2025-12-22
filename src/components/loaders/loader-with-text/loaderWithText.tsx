"use client";

import { CircularProgress } from "@nextui-org/progress";
import { useEffect, useState } from "react";

function LoaderWithText() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen">
        <div className="w-36 h-36 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-center text-lg font-medium">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <CircularProgress
        classNames={{
          base: "animate-spin",
          svg: "w-36 h-36 ",
          indicator: "stroke-indigo-600",
          track: "stroke-indigo-200",
        }}
        strokeWidth={2}
        disableAnimation={true}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-center text-lg font-medium">Loading</span>
      </div>
    </div>
  );
}

export default LoaderWithText;
