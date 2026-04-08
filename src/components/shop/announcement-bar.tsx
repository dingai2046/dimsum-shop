"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  text: string;
  link?: string;
  linkText?: string;
  type?: "info" | "promo" | "warning";
}

const typeStyles = {
  info: "bg-primary/10 text-primary",
  promo: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
  warning: "bg-amber-500 text-white",
};

export function AnnouncementBar({ text, link, linkText, type = "promo" }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={`relative py-2.5 text-center text-sm ${typeStyles[type]}`}>
      <div className="mx-auto max-w-7xl px-10">
        <span>{text}</span>
        {link && linkText && (
          <Link href={link} className="ml-2 font-semibold underline underline-offset-2 hover:no-underline">
            {linkText}
          </Link>
        )}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="关闭公告"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
