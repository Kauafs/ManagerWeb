import React from "react";
import { IoPersonCircle, IoMoon, IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export interface AppMainProps {
  title: string;
  children: React.ReactNode;
}

export default function AppMainContainer({ title, children }: AppMainProps) {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full">
  
      <header className="flex flex-col bg-white shadow-sm rounded-b-[40px] border border-gray-100 border-t-0">
        
   
        <div className="h-[60px] flex items-center justify-between px-10 border-b border-gray-100">
          <span className="text-[#4A0000] font-black text-[11px] uppercase tracking-[4px] opacity-60">
           SAVEU • ADMINISTRATIVO
          </span>
          
          <div className="flex gap-5 text-gray-400 items-center">
           
            <button className="hover:text-[#4A0000] transition-colors cursor-pointer outline-none">
              <IoMoon size={20} />
            </button>
            
           
            <button className="relative hover:text-[#4A0000] transition-colors cursor-pointer outline-none">
              <IoNotifications size={20} onClick={() => navigate('/admin/notificacao/')} />
              <span className="absolute -top-1 -right-1 bg-[#4A0000] w-2 h-2 rounded-full border-2 border-white"></span>
            </button>
            
          
            <button className="hover:text-[#4A0000] transition-colors cursor-pointer outline-none">
              <IoPersonCircle size={30} className="text-gray-300 hover:text-[#4A0000] transition-all" onClick={() => navigate('/admin/perfil/')} />
            </button>
          </div>
        </div>

       
        <div className="p-10 flex flex-col">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight leading-none uppercase">
            {title}
          </h1>
          <div className="h-1.5 w-12 bg-[#4A0000] rounded-full mt-4" />
          <p className="text-gray-400 text-sm mt-3 font-medium">Protocolos de Suporte Básico de Vida.</p>
        </div>
      </header>

  
      <div className="h-8 w-full" />

     
      <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
        <div className="flex-1 p-10 pb-32">
          {children}
        </div>

       
        <footer className="w-full mt-auto border-t border-gray-50 py-8 text-center text-[10px] text-gray-400 font-bold tracking-[3px] uppercase">
          © {currentYear} <span className="text-[#4A0000]">SAVEU</span> • Inteligência em Emergência
        </footer>
      </section>
      
    </div>
  );
}