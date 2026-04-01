"use client";
import React from "react";
import { Check } from "lucide-react";

type InterestPillProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function InterestPill({ label, selected, onClick }: InterestPillProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";
  const variant = selected
    ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600 hover:border-orange-600"
    : "border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50";

  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`${base} ${variant}`}>
      {selected && <Check className="h-4 w-4" aria-hidden="true" />}
      <span>{label}</span>
    </button>
  );
}
