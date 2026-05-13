import { auth } from '../../../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AppMainContainer from '../../../styles/main';
import AppButton from '../../../styles/button';
import { IoPersonOutline, IoMailOutline,  IoTimeOutline,IoFingerPrintOutline } from 'react-icons/io5';

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

  if (!user) 
    return null;

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