import { useState, useEffect } from 'react';
import AppMainContainer from "../../../styles/main";
import { db } from '../../../../firebaseConfig'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  IoShieldOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoAlertCircleOutline,
  IoChevronBack,
  IoChevronForward 
} from 'react-icons/io5';

interface LogEmergencia {
  nomeParticipante: string;
  tipoSocorro: string;
  tipoPessoa: string;
  acionamento: string;
  idEmergencia: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEmergencia[]>([]);
  const [loading, setLoading] = useState(true);

 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, "logs_emergencia"), orderBy("acionamento", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as LogEmergencia);
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  
  const totalPages = Math.max(1, Math.ceil(logs.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = logs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <AppMainContainer title="Monitoramento de Ocorrências">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">
        
   
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4 px-2">
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight text-left">Histórico de Atendimentos</h1>
            <p className="text-sm text-gray-400 font-medium italic text-left">Dados em tempo real dos acionamentos via plataforma SAVEU.</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-red-900 uppercase tracking-widest">Servidor Ativo</span>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#4A0000]">
                <tr>
                  <th className="p-5 text-white font-black uppercase tracking-widest text-[11px] rounded-tl-[24px] text-left">
                    <div className="flex items-center gap-2"><IoAlertCircleOutline size={14}/> ID / Protocolo</div>
                  </th>
                  <th className="p-5 text-white font-black uppercase tracking-widest text-[11px] text-left">Socorrista</th>
                  <th className="p-5 text-center text-white font-black uppercase tracking-widest text-[11px]">Tipo de Socorro</th>
                  <th className="p-5 text-center text-white font-black uppercase tracking-widest text-[11px]">Paciente</th>
                  <th className="p-5 text-right text-white font-black uppercase tracking-widest text-[11px] rounded-tr-[24px]">
                    <div className="flex items-center justify-end gap-2"><IoTimeOutline size={14}/> Horário</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A0000] mx-auto mb-3" />
                      <span className="text-[10px] font-black text-[#4A0000] uppercase tracking-widest">Sincronizando logs...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <IoShieldOutline className="mx-auto text-gray-100 mb-4" size={48} />
                      <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Nenhuma ocorrência registrada hoje.</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((log, index) => (
                    <tr key={index} className="hover:bg-red-50/20 transition-colors group">
                      <td className="p-5 text-left">
                        <span className="font-mono text-[11px] text-gray-400 font-bold">#{log.idEmergencia}</span>
                      </td>
                      <td className="p-5 text-left text-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#4A0000] transition-all border border-transparent group-hover:border-red-100">
                            <IoPersonOutline size={16} />
                          </div>
                          <p className="font-black uppercase text-sm tracking-tight">{log.nomeParticipante}</p>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-[10px] font-black text-[#4A0000] uppercase tracking-tighter">
                          {log.tipoSocorro}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{log.tipoPessoa}</p>
                      </td>
                      <td className="p-5 text-right text-gray-800">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black tabular-nums leading-none">
                            {new Date(log.acionamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                             Segundos: {new Date(log.acionamento).getSeconds()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && logs.length > 0 && (
            <div className="p-6 bg-white flex items-center justify-between border-t border-gray-50">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Mostrando <span className="text-gray-900">{currentItems.length}</span> de <span className="text-gray-900">{logs.length}</span> ocorrências
              </p>
              <div className="flex gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${currentPage === 1 ? 'bg-gray-50 text-gray-200 border-gray-100' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
                >
                  <IoChevronBack size={20} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${currentPage === totalPages ? 'bg-gray-50 text-gray-200 border-gray-100' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
                >
                  <IoChevronForward size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppMainContainer>
  );
}