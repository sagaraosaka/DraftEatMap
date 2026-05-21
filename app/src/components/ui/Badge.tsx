import { StoreStatus } from "@/types/store";

interface BadgeProps {
  status: StoreStatus;
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
        status === "visited"
          ? "bg-eat-green/10 text-eat-green"
          : "bg-eat-red/10 text-eat-red"
      }`}
    >
      {status === "visited" ? "訪問済" : "未訪問"}
    </span>
  );
}
