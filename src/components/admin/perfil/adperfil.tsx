import { auth } from '../../../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AppMainContainer from '../../../styles/main';
import AppButton from '../../../styles/button';
import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoTimeOutline, 
  IoFingerPrintOutline,
  IoPeopleOutline, 
  IoCodeSlashOutline, 
  IoColorPaletteOutline, 
  IoHandRightOutline, 
  IoCubeOutline 
} from 'react-icons/io5';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente encerrar a sessão administrativa?")) {
      try {
        await signOut(auth);
        window.location.href = "/"; 
      } catch (error) {
        console.error("Erro ao sair:", error);
      }
    }
  };

  const ultimoAcesso = user?.metadata?.lastSignInTime 
    ? new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR') 
    : 'Não identificado';

  if (!user) return null;

  return (
    <AppMainContainer title="Gestão de Identidade Administrativa">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
        
   
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#4A0000] p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IoPersonOutline className="text-white" size={28} />
              <h2 className="text-white font-black uppercase tracking-[3px] text-sm">Dados do Administrador</h2>
            </div>
          </div>

          <div className="p-12 space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-10 border-b border-gray-50 pb-12">
               <div className="bg-[#fbfbfb] p-6 rounded-[35px] border border-gray-100 shadow-inner">
                  <IoFingerPrintOutline size={80} className="text-[#4A0000]" />
               </div>
               <div className="text-center md:text-left">
                  <h3 className="text-4xl font-black text-gray-800 uppercase tracking-tight mb-2">
                    {user?.displayName || "Administrador Central"}
                  </h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs ml-1">Perfil nível: Master Root</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  <IoMailOutline size={14} /> E-mail de Credencial
                </label>
                <div className="w-full border border-gray-200 p-6 rounded-2xl bg-[#fbfbfb] text-gray-700 font-bold text-lg">
                  {user?.email}
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  <IoTimeOutline size={14} /> Última Autenticação
                </label>
                <div className="w-full border border-gray-200 p-6 rounded-2xl bg-[#fbfbfb] text-gray-700 font-bold text-lg">
                  {ultimoAcesso}
                </div>
              </div>
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#4A0000] p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IoCubeOutline className="text-white" size={28} />
              <h2 className="text-white font-black uppercase tracking-[3px] text-sm">Informações de Desenvolvimento</h2>
            </div>
          </div>

          <div className="p-12 space-y-12">
           
            <div className="border-b border-gray-100 pb-10">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                Desenvolvido por:
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 justify-start">
               
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex items-center justify-center w-full sm:w-60 h-28 shadow-sm">
                  <img 
                    src="/public/img/gif2.gif" 
                    alt="CESMAC CITEC" 
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

               
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex items-center justify-center w-full sm:w-60 h-28 shadow-sm">
                  <img 
                    src="/public/img/med1.png" 
                    alt="Medicina CESMAC" 
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Professores e Pesquisadores */}
              <div className="bg-[#fbfbfb] border border-gray-200/60 p-8 rounded-3xl hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#4A0000]/10 p-3 rounded-2xl">
                    <IoPeopleOutline className="text-[#4A0000]" size={22} />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Professores e Pesquisadores envolvidos:
                  </h4>
                </div>
                <ul className="space-y-3 pl-1">
                  {['Isabele Maranhão', 'Luiz Mansur'].map((nome, idx) => (
                    <li key={idx} className="text-gray-700 font-bold text-base flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-[#4A0000] rounded-full"></span>
                      {nome}
                    </li>
                  ))}
                </ul>
              </div>

            
              <div className="bg-[#fbfbfb] border border-gray-200/60 p-8 rounded-3xl hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#4A0000]/10 p-3 rounded-2xl">
                    <IoCodeSlashOutline className="text-[#4A0000]" size={22} />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Desenvolvedores responsáveis:
                  </h4>
                </div>
                <ul className="space-y-3 pl-1">
                  {['Felipe Kauã', 'Bruno', 'Alvaro'].map((nome, idx) => (
                    <li key={idx} className="text-gray-700 font-bold text-base flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-[#4A0000] rounded-full"></span>
                      {nome}
                    </li>
                  ))}
                </ul>
              </div>

              
              <div className="bg-[#fbfbfb] border border-gray-200/60 p-8 rounded-3xl hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#4A0000]/10 p-3 rounded-2xl">
                    <IoColorPaletteOutline className="text-[#4A0000]" size={22} />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Designers:
                  </h4>
                </div>
                <ul className="space-y-3 pl-1">
                  {['Dayane Pontes'].map((nome, idx) => (
                    <li key={idx} className="text-gray-700 font-bold text-base flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-[#4A0000] rounded-full"></span>
                      {nome}
                    </li>
                  ))}
                </ul>
              </div>

      
              <div className="bg-[#fbfbfb] border border-gray-200/60 p-8 rounded-3xl hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#4A0000]/10 p-3 rounded-2xl">
                    <IoHandRightOutline className="text-[#4A0000]" size={22} />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Colaboração:
                  </h4>
                </div>
                <p className="text-gray-400 font-semibold text-sm italic pl-1">
                  Nenhuma colaboração externa adicional cadastrada para esta versão.
                </p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="flex items-center justify-end gap-6 px-2">
          <div className="w-48">
            <AppButton 
              name="Voltar ao Painel" 
              form="round" 
              type="outline" 
              onClick={() => navigate("/admin/dashboard")} 
            />
          </div>

          <div className="w-72">
            <AppButton 
              name="Encerrar sessão" 
              form="round" 
              type="solid"
              onClick={handleLogout} 
            /> 
          </div>
        </div>

      </div>
    </AppMainContainer>
  );
}