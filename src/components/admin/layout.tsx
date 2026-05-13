import { Outlet } from "react-router-dom";
import AppMenu from "../../styles/menu";

export default function AdminLayout() {
  return (
    <div className="flex h-screen w-full bg-[var(--background-secondary)] overflow-hidden ff-default">
      <aside className="h-full shrink-0 bg-[var(--background-primary)] border-r border-gray-200 shadow-sm">
        <AppMenu />
      </aside>

      <div className="flex-1 overflow-y-auto px-8 pt-0 pb-8">
        <main className="w-full max-w-[1600px] mx-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}