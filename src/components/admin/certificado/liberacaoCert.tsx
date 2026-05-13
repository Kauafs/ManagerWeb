import { useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig'; 
import { collection, query, onSnapshot, doc, getDoc, where, getDocs } from 'firebase/firestore';
import AppMainContainer from '../../../styles/main';
import GeradorCertificado from './certified';
import { IoCheckmarkCircle, IoTimeOutline, IoChevronBack, IoChevronForward, IoRibbonOutline } from 'react-icons/io5';

const LiberacaoCertificados = () => {
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 


  const formatarCPF_LGPD = (cpf: string) => {
    if (!cpf) return "---";
    const clean = cpf.replace(/\D/g, "");
    return clean.length === 11 
      ? `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**` 
      : cpf;
  };

  useEffect(() => {
    const q = query(collection(db, "resultados_simulacao"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const mapaAgrupado: Record<string, any> = {};

      snapshot.docs.forEach(docRes => {
        const dados = docRes.data();
        const cpf = dados.cpf || docRes.id;

        if (!mapaAgrupado[cpf] || (dados.status_pratica === true && !mapaAgrupado[cpf].status_pratica)) {
          mapaAgrupado[cpf] = {
            id: docRes.id,
            ...dados,
            cpf: cpf
          };
        }
      });

      const cpfsUnicos = Object.values(mapaAgrupado);
      
      const promessas = cpfsUnicos.map(async (alunoData: any) => {
        const certSnap = await getDoc(doc(db, "certificados", alunoData.cpf));
        
        const qKirk = query(
          collection(db, "indicadores_kirkpatrick"), 
          where("id_participante", "==", alunoData.cpf)
        );
        const kirkSnap = await getDocs(qKirk);
        
        const kirkData = !kirkSnap.empty ? kirkSnap.docs[0].data() : null;

        return {
          ...alunoData,
          liberado: certSnap.exists() && certSnap.data()?.url_pdf,
          dadosCertificado: certSnap.exists() ? certSnap.data() : null,
          indicadores: kirkData
        };
      });

      const resultadosFinais = await Promise.all(promessas);
      resultadosFinais.sort((a, b) => a.nome.localeCompare(b.nome));
      
      setLista(resultadosFinais);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const totalItems = lista.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = lista.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <AppMainContainer title='Liberação de Certificados'>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Aptidão Certificado</h1>
            <p className="text-sm text-gray-400 font-medium italic">Monitoramento de métricas Kirkpatrick e emissão.</p>
          </div>
          <div className="bg-red-50 border border-red-100 px-4 py-1 rounded-full">
            <span className="text-[10px] font-black text-[#4A0000] uppercase">Total: {totalItems} Alunos</span>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-[#4A0000] text-white">
              <tr>
                <th className="p-6 text-left text-[11px] font-black uppercase tracking-widest">Aluno / Identificação</th>
                <th className="p-6 text-center text-[11px] font-black uppercase tracking-widest">Métricas (Score / Impacto)</th>
                <th className="p-6 text-center text-[11px] font-black uppercase tracking-widest">Status Prática</th>
                <th className="p-6 text-right text-[11px] font-black uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 uppercase text-[10px] font-bold">Processando dados acadêmicos...</td>
                </tr>
              ) : currentItems.map((item) => (
                <tr key={item.cpf} className="hover:bg-red-50/10 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg text-gray-400 group-hover:text-[#4A0000] transition-colors">
                        <IoRibbonOutline size={16} />
                      </div>
                      <div>
                        <p className="font-black text-gray-800 uppercase text-sm leading-none mb-1">{item.nome}</p>
                        <p className="text-[10px] text-gray-400 font-mono italic">
                          CPF: {formatarCPF_LGPD(item.cpf)}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-6">
                    {item.indicadores ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${item.indicadores.impacto === 'Apto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {item.indicadores.impacto}
                          </span>
                          <span className="text-[#4A0000] font-black text-base">{item.indicadores.score_global}</span>
                        </div>
                        <div className="flex gap-3 text-[9px] text-gray-400 font-black uppercase">
                          <span>Reação: {item.indicadores.nivel1_reacao}/5</span>
                          <span>Aprendizagem: {item.indicadores.nivel2_aprendizagem}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-[9px] text-gray-300 uppercase font-black italic">Aguardando Consolidação</p>
                    )}
                  </td>

                  <td className="p-6 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                        item.status_pratica ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {item.status_pratica ? <IoCheckmarkCircle size={14} /> : <IoTimeOutline size={14} />}
                        {item.status_pratica ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center">
                      {item.liberado ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-emerald-600 mb-1 tracking-widest uppercase">✓ Liberado no Perfil</span>
                          <a href={item.dadosCertificado?.url_pdf} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-600 underline uppercase hover:text-blue-800">
                            Download PDF
                          </a>
                        </div>
                      ) : (
                        <GeradorCertificado 
                          nomeAluno={item.nome}
                          cpfAluno={item.cpf}
                          dataEmissao={new Date().toLocaleDateString('pt-BR')}
                          codigoAutenticidade={Math.random().toString(36).toUpperCase().substring(2, 11)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- RODAPÉ DE PAGINAÇÃO --- */}
          <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-white">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              PERFORMANCE {currentPage} DE {totalPages || 1}
            </span>

            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)} 
                className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 hover:text-[#4A0000] hover:border-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <IoChevronBack size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(prev => prev + 1)} 
                className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-[#4A0000] hover:bg-red-50 hover:border-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <IoChevronForward size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppMainContainer>
  );
};

export default LiberacaoCertificados;