import BottomNav from "@/components/layout/BottomNav";
import MapsProvider from "@/components/layout/MapsProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MapsProvider>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">{children}</div>
        <BottomNav />
      </div>
    </MapsProvider>
  );
}
