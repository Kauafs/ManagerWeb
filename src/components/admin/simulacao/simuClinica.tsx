import { useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig'; 
import { collection, query, onSnapshot } from 'firebase/firestore';
import AppMainContainer from '../../../styles/main';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../../styles/button';
import { IoBarChartOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface ResultadoSimulacao {
  id: string;
  nome: string;
  cpf: string;
  titulo_simulacao?: string;
  aderencia_protocolo: number;
  tempo_compressao?: number;
  status_pratica: boolean;
}

const PainelResultados = () => {
  const [resultados, setResultados] = useState<ResultadoSimulacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCenario, setFiltroCenario] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const formatarCPF_LGPD = (cpf: string) => {
    if (!cpf) return "---";
    const clean = cpf.replace(/\D/g, "");
    return clean.length === 11 
      ? `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**` 
      : cpf;
  };

  useEffect(() => {
    const q = query(collection(db, "resultados_simulacao"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as ResultadoSimulacao[];
      setResultados(lista);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cenariosUnicos = ["Todos", ...Array.from(new Set(resultados.map(r => r.titulo_simulacao || "Cenário Padrão")))];
  const dadosFiltrados = resultados.filter(res => filtroCenario === "Todos" ? true : res.titulo_simulacao === filtroCenario);
  const totalPages = Math.max(1, Math.ceil(dadosFiltrados.length / itemsPerPage));
  const currentItems = dadosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AppMainContainer title='Simulação Clínica'>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Relatório de Desempenho</h2>
          <p className="text-sm text-gray-400 font-medium italic text-left">Métricas da prática mobile e aderência aos protocolos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            {cenariosUnicos.slice(0, 4).map((cenario) => (
              <button
                key={cenario}
                onClick={() => { setFiltroCenario(cenario); setCurrentPage(1); }}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filtroCenario === cenario 
                  ? "bg-[#4A0000] text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {cenario === "Todos" ? "Todos" : cenario.substring(0, 8)}
              </button>
            ))}
          </div>

          <div className="w-36">
            <AppButton name='Criar Cenário' form='round' type='outline' onClick={() => navigate('/admin/simulacao/createSimulacao')} />
          </div>
          <div className="w-36">
            <AppButton name='Questões' form='round' type='solid' onClick={() => navigate('/admin/simulacao/registerQuestions')} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#4A0000]">
              <tr>
                <th className="p-5 text-white font-black uppercase tracking-widest text-[11px] rounded-tl-[24px] text-left">Participante</th>
                <th className="p-5 text-white font-black uppercase tracking-widest text-[11px] text-left">Tópico</th>
                <th className="p-5 text-center text-white font-black uppercase tracking-widest text-[11px]">Tempo</th>
                <th className="p-5 text-left text-white font-black uppercase tracking-widest text-[11px]">Aderência</th>
                <th className="p-5 text-center text-white font-black uppercase tracking-widest text-[11px] rounded-tr-[24px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-[10px] font-bold uppercase text-[#4A0000]">Carregando...</td></tr>
              ) : currentItems.map((res) => (
                <tr key={res.id} className="hover:bg-red-50/20 transition-colors group">
                  <td className="p-5 text-left">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg text-gray-400 group-hover:text-[#4A0000] transition-colors">
                        <IoBarChartOutline size={16} />
                      </div>
                      <div>
                        <p className="font-black text-gray-700 uppercase text-sm mb-1">{res.nome}</p>
                        <p className="text-[10px] text-gray-400 font-mono italic">
                          CPF: {formatarCPF_LGPD(res.cpf)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-left">
                    <span className="text-[10px] font-black text-[#4A0000] bg-red-50 px-3 py-1 rounded-lg uppercase">
                      {res.titulo_simulacao || "Cenário Padrão"}
                    </span>
                  </td>
                  <td className="p-5 text-center font-black text-gray-600">
                    {res.tempo_compressao ? `${res.tempo_compressao}s` : '--'}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[80px] overflow-hidden">
                        <div 
                          className={`h-full ${res.aderencia_protocolo >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${(res.aderencia_protocolo * 100)}%` }}
                        />
                      </div>
                      <span className="font-black text-gray-800 text-xs">{(res.aderencia_protocolo * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                      res.status_pratica ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {res.status_pratica ? 'Apto Presencial' : 'Pendente'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-white flex items-center justify-between border-t border-gray-50">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Exibindo {currentItems.length} registros
          </p>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-gray-50 text-gray-200' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
            >
              <IoChevronBack size={20} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-gray-50 text-gray-200' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
            >
              <IoChevronForward size={20} />
            </button>
          </div>
        </div>
      </div>
    </AppMainContainer>
  );
};

export default PainelResultados;