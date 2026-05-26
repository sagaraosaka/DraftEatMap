"use client";

import Chip from "@/components/ui/Chip";

export type FilterValue = "all" | "unvisited" | "visited" | string;

interface FilterChipsProps {
  active: FilterValue;
  tags: string[];
  onChange: (value: FilterValue) => void;
}

const BASE_FILTERS = [
  { value: "all",       label: "すべて",  dot: undefined        },
  { value: "unvisited", label: "未訪問",  dot: "bg-eat-red"     },
  { value: "visited",   label: "訪問済",  dot: "bg-eat-green"   },
] as const;

export default function FilterChips({ active, tags, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none">
      {BASE_FILTERS.map(({ value, label, dot }) => (
        <Chip
          key={value}
          label={label}
          dot={dot}
          active={active === value}
          onClick={() => onChange(value)}
        />
      ))}
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          active={active === tag}
          onClick={() => onChange(tag)}
        />
      ))}
    </div>
  );
}
