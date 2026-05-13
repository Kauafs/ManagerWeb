import { Link } from "react-router-dom";

interface MenuItemProps {
  title: string;
  icon: React.ReactNode;
  url: string;
  active?: boolean;
}

export default function MenuItem({ title, icon, url, active }: MenuItemProps) {
  return (
    <Link to={url} className="block no-underline">
      <div
        className={`flex items-center gap-4 pl-5 py-3 cursor-pointer mb-1 rounded-s-full text-[15px] font-bold transition-all duration-200 ${
          active 
            ? "text-white bg-[#4A0000] shadow-md shadow-red-900/20 translate-x-1" 
            : "text-gray-500 hover:bg-red-50 hover:text-[#4A0000]"
        }`}
      >
        <span className={`text-xl transition-transform ${active ? "scale-110" : "opacity-70"}`}>
          {icon}
        </span>
        <span className="hidden md:flex tracking-wide uppercase text-[13px]">
          {title}
        </span>
      </div>
    </Link>
  );
}