"use client";
import React from "react";
import Image from "next/image";
import clsx from "clsx";

export type HNHMessBannerProps = {
  variant: "essentials" | "xtreme";
  className?: string;
  priority?: boolean;
};

export function HNHMessBanner({ variant, className, priority }: HNHMessBannerProps) {
  const src = variant === "essentials" ? "/hnhmess/essentials-banner.svg" : "/hnhmess/xtreme-banner.svg";
  const alt = variant === "essentials" ? "HOTMESS Essentials" : "HNH London presents XXXtreme HOTMESS";
  return (
    <div className={clsx("relative w-full overflow-hidden rounded-md border border-token bg-[var(--color-surface)]", className)}>
      <div className="aspect-[16/6] relative">
        <Image src={src} alt={alt} fill sizes="100vw" priority={priority} className="object-cover" />
      </div>
    </div>
  );
}
