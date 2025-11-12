"use client";
import React from "react";
import Image from "next/image";
import clsx from "clsx";

type Overlay = "primary" | "accent" | "dual" | "dark";

type EditorialHeaderBase = {
  title: string;
  subtitle?: string;
  overlay?: Overlay;
  height?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  className?: string;
};

export type EditorialHeaderProps = EditorialHeaderBase & {
  chapter?: string;
  image?: string;
};

const overlayClass = (overlay?: Overlay) => {
  switch (overlay) {
    case "primary":
      return "bg-[var(--color-primary)]/25";
    case "accent":
      return "bg-[var(--color-accent)]/25";
    case "dual":
      return "bg-gradient-to-r from-[var(--color-primary)]/25 to-[var(--color-accent)]/25";
    case "dark":
      return "bg-black/50";
    default:
      return "";
  }
};

const heightClass = (h?: "small" | "medium" | "large") =>
  h === "large" ? "min-h-[70vh]" : h === "small" ? "min-h-[35vh]" : "min-h-[50vh]";

export function EditorialHeader({ chapter, title, subtitle, image, overlay = "dual", height = "large", icon, className }: EditorialHeaderProps) {
  return (
    <header className={clsx("relative w-full overflow-hidden", heightClass(height), className)}>
      {image && (
        <Image src={image} alt="" fill priority sizes="100vw" className="object-cover"/>
      )}
      <div className={clsx("absolute inset-0", overlayClass(overlay))} />
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 text-center">
        {chapter && <div className="text-xs tracking-[0.25em] text-muted">{chapter}</div>}
        <h1 className="mt-2 font-semibold">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>}
        {icon && <div className="mt-6 opacity-80">{icon}</div>}
      </div>
    </header>
  );
}

export function SplitEditorialHeader({ title, subtitle, leftImage, rightImage, overlay = "dual", className }: { title: string; subtitle?: string; leftImage?: string; rightImage?: string; overlay?: Overlay; className?: string; }) {
  return (
    <header className={clsx("relative grid min-h-[60vh] w-full grid-cols-1 md:grid-cols-2 overflow-hidden", className)}>
      <div className="relative">
        {leftImage && <Image src={leftImage} alt="" fill sizes="50vw" className="object-cover" />}
        <div className={clsx("absolute inset-0", overlayClass(overlay))} />
      </div>
      <div className="relative">
        {rightImage && <Image src={rightImage} alt="" fill sizes="50vw" className="object-cover" />}
        <div className={clsx("absolute inset-0", overlayClass(overlay))} />
      </div>
      <div className="absolute inset-0 z-10 mx-auto flex max-w-7xl items-center justify-center px-6">
        <div className="text-center md:text-left">
          <h1 className="font-semibold">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
