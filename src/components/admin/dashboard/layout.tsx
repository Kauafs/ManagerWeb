import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import AppMainContainer from "../../../styles/main";
import { IoPeople, IoCheckmarkCircle, IoCloseCircle, IoCalendar, IoStatsChart,IoNotificationsOutline,IoDocumentTextOutline} from "react-icons/io5";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const data = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setStudents(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };
    getStudents();
  }, []);

  const total = students.length;
  const ativos = students.filter((s) => s.progresso?.concluido === true).length;
  const inativos = students.filter((s) => s.progresso?.concluido === false).length;


  const chartData = [
    { name: "Aprovados", value: ativos },
    { name: "Pendentes", value: inativos },
  ];

  const COLORS = ["#FFFFFF", "rgba(255, 255, 255, 0.2)"];

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();

  const cadastrosMes = students.filter((s) => {
    if (!s.data_cadastro) return false;
    const data = new Date(s.data_cadastro);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  }).length;

  return (
    <AppMainContainer title="Dashboard Administrativo">
      
     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 rounded-2xl text-[#4A0000]"><IoPeople size={24} /></div>
            <span className="text-[10px] font-black text-[#4A0000] bg-red-50 px-3 py-1 rounded-full uppercase tracking-tighter">Geral</span>
          </div>
          <div className="mt-4">
            <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">Usuários</h2>
            <p className="text-4xl font-black text-gray-800 tracking-tighter">{loading ? "..." : total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 rounded-2xl text-[#4A0000]"><IoCheckmarkCircle size={24} /></div>
            <span className="text-[10px] font-black text-[#4A0000] bg-red-50 px-3 py-1 rounded-full uppercase tracking-tighter">Certificados</span>
          </div>
          <div className="mt-4">
            <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">Concluídos</h2>
            <p className="text-4xl font-black text-gray-800 tracking-tighter">{loading ? "..." : ativos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 rounded-2xl text-[#4A0000]"><IoCloseCircle size={24} /></div>
            <span className="text-[10px] font-black text-[#4A0000] bg-red-50 px-3 py-1 rounded-full uppercase tracking-tighter">Simulação</span>
          </div>
          <div className="mt-4">
            <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">Em Andamento</h2>
            <p className="text-4xl font-black text-gray-800 tracking-tighter">{loading ? "..." : inativos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 rounded-2xl text-[#4A0000]"><IoCalendar size={24} /></div>
            <span className="text-[10px] font-black text-[#4A0000] bg-red-50 px-3 py-1 rounded-full uppercase tracking-tighter">Recentes</span>
          </div>
          <div className="mt-4">
            <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">Novos Alunos</h2>
            <p className="text-4xl font-black text-gray-800 tracking-tighter">{loading ? "..." : cadastrosMes}</p>
          </div>
        </div>
      </div>

   
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        
      
        <div className="flex flex-col gap-10"> 
          
          <div className="bg-white border border-gray-100 shadow-sm rounded-[32px] p-10 border-l-[12px] border-l-[#4A0000] flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 text-[#4A0000]">
              <IoDocumentTextOutline size={22} />
              <h2 className="font-black text-xl text-gray-800 uppercase tracking-tighter">Relatórios de Atividade</h2>
            </div>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Consolidado de usuários registrados no sistema. Mantenha os protocolos de auditoria ativos para conformidade com o ecossistema <strong>SAVEU</strong>.
            </p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-[32px] p-10 border-l-[12px] border-l-[#4A0000] flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 text-[#4A0000]">
              <IoNotificationsOutline size={22} />
              <h2 className="font-black text-xl text-gray-800 uppercase tracking-tighter">Notificações Acadêmicas</h2>
            </div>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Existem <strong className="text-[#4A0000] font-black">{ativos}</strong> certificados pendentes de validação técnica. Verifique a fila de emissão para liberar o acesso ao aplicativo móvel.
            </p>
          </div>
        </div>

        <div className="bg-[#4A0000] shadow-2xl rounded-[40px] p-10 flex flex-col items-center justify-between min-h-[480px] relative overflow-hidden">
          
          <div className="w-full text-center z-10">
            <div className="flex justify-center mb-4">
               <span className="bg-white/10 p-4 rounded-[20px] text-white backdrop-blur-sm">
                  <IoStatsChart size={28} />
               </span>
            </div>
            <h2 className="font-black text-3xl text-white uppercase tracking-tighter">Métricas de Retenção</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px] mt-2">Taxa de Conclusão Global</p>
          </div>

        
          <div className="w-full h-56 z-10 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-white font-black text-3xl leading-none">
                  {total > 0 ? Math.round((ativos / total) * 100) : 0}%
                </p>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-tighter mt-1">Aproveitamento</p>
            </div>
          </div>


          <div className="w-full grid grid-cols-2 gap-6 z-10">
              <div className="bg-white/5 p-4 rounded-[24px] border border-white/10 text-center backdrop-blur-md">
                  <p className="text-white/40 text-[9px] font-black uppercase mb-1 tracking-widest">Aprovados</p>
                  <p className="text-white text-xl font-black">{ativos}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-[24px] border border-white/10 text-center backdrop-blur-md">
                  <p className="text-white/40 text-[9px] font-black uppercase mb-1 tracking-widest">Pendentes</p>
                  <p className="text-white text-xl font-black">{inativos}</p>
              </div>
          </div>

         
          <div className="absolute -bottom-10 -right-10 text-white/5 font-black text-[120px] pointer-events-none select-none">
            SVU
          </div>
        </div>
      </div>

    </AppMainContainer>
  );
}

export default Dashboard;