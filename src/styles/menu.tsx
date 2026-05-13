import { useLocation } from "react-router-dom";
import { IoGrid, IoLogOut, IoDocumentText, IoChatbubbles, IoClipboard, IoNotifications, IoMedkit, IoPeople,IoPulse } from "react-icons/io5";
import MenuItem from "./path-menus"; 
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function AppMenu() {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <div className="w-[300px] bg-white flex flex-col h-full border-r border-gray-100 shadow-sm">
      
   
      <div className="flex flex-col items-center pt-[60px] shrink-0 px-6">
        <div className="w-full flex items-center justify-center mb-6">
          <img 
            src="/public/img/logoof2.png" 
            alt="SAVEU"
            className="h-20 object-contain" 
           
          />
        </div>
        
        <h1 className="text-[14px] font-black text-center text-[#4A0000] tracking-[3px] uppercase opacity-80">
          Gerenciador Web
        </h1>
        

        <div className="bg-[#4A0000] h-[2px] mt-6 w-12 rounded-full opacity-20" />
      </div>

   
      <div className="pl-[20px] pr-[10px] mt-[40px] flex-1 overflow-y-auto space-y-1">
        <MenuItem
          title="Dashboard"
          icon={<IoGrid />}
          url="/admin/dashboard"
          active={location.pathname.startsWith("/admin/dashboard")}
        />
        
        <MenuItem
          title="Conteúdo"
          icon={<IoDocumentText />}
          url="/admin/content"
          active={location.pathname.startsWith("/admin/content")}
        />

        <MenuItem
          title="Cadastros"
          icon={<IoPeople />}
          url="/admin/registers"
          active={location.pathname.startsWith("/admin/registers")}
        />

        <MenuItem
          title="Fórum"
          icon={<IoChatbubbles />}
          url="/admin/questions"
          active={location.pathname.startsWith("/admin/questions")}
        />

        <MenuItem
          title="Avaliações"
          icon={<IoClipboard />}
          url="/admin/proof"
          active={location.pathname.startsWith("/admin/proof")}
        />

        <MenuItem
          title="Certificados"
          icon={<IoDocumentText />}
          url="/admin/certificado"
          active={location.pathname === "/admin/certificado"}
        />

        <MenuItem
          title="Notificações"
          icon={<IoNotifications />}
          url="/admin/notificacao"
          active={location.pathname.startsWith("/admin/notificacao")}
        />

        <MenuItem
          title="Simulação Clínica"
          icon={<IoPulse />}
          url="/admin/simulacao"
          active={location.pathname.startsWith("/admin/simulacao")}
        />

        <MenuItem
          title="Suporte Emergencial"
          icon={<IoMedkit />}
          url="/admin/emergencia"
          active={location.pathname.startsWith("/admin/emergencia")}
        />
      </div>

     
      <div className="mt-auto pb-[50px] pt-4 shrink-0 border-t border-gray-50">
        <div
          className="text-[16px] text-[#4A0000] cursor-pointer font-black flex items-center justify-center gap-2 hover:opacity-70 transition-all uppercase"
          onClick={handleLogout}
        >
          <IoLogOut className="text-2xl" />
          <span>Sair</span>
        </div>
      </div>
    </div>
  );
}