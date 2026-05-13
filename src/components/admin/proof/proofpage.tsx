import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; 
import { IoStatsChart, IoChevronBack, IoChevronForward, IoHourglassOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import AppMainContainer from "../../../styles/main";
import AppButton from "../../../styles/button";

export default function ProofPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "pre" | "post" | "retencao">("all");
  
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
    const getResults = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const allData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const onlyStudents = allData.filter((user: any) => user.role !== "admin");
        setResults(onlyStudents);
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
      } finally {
        setLoading(false);
      }
    };
    getResults();
  }, []);

  const getStatusJornada = (user: any) => {
    const hoje = new Date();
    const dataLibStr = user.progresso?.data_liberacao_pos_teste;
    
    const temPre = user.notas && typeof user.notas.pre_teste === 'number';
    const temPost = user.notas && typeof user.notas.pos_teste === 'number';

    if (user.certificacao_concluida) {
      return { label: "Certificado", cor: "text-blue-700 border-blue-100 bg-blue-50", type: "post" };
    }
    
    if (dataLibStr) {
      const dataLib = new Date(dataLibStr);
      if (hoje < dataLib) {
        const dias = Math.ceil((dataLib.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return { label: `Retenção (${dias}d)`, cor: "text-orange-600 border-orange-100 bg-orange-50", type: "retencao" };
      }
      if (!temPost) return { label: "Liberado Pós", cor: "text-[#4A0000] border-red-100 bg-red-50", type: "post" };
    }

    if (temPost) 
      return { label: "Concluído", cor: "text-green-700 border-green-100 bg-green-50", type: "post" };
    if (temPre) 
      return { label: "Em Curso", cor: "text-emerald-700 border-emerald-100 bg-emerald-50", type: "pre" };
    
    return { label: "Pendente", cor: "text-amber-600 border-amber-100 bg-amber-50", type: "all" };
  };

  const filteredResults = results.filter((s) => {
    const status = getStatusJornada(s);
    if (filterType === "pre") return s.notas && typeof s.notas.pre_teste === 'number';
    if (filterType === "post") return s.notas && typeof s.notas.pos_teste === 'number';
    if (filterType === "retencao") return status.type === "retencao";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = Math.max(0, indexOfLastItem - itemsPerPage);
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

  const handleFilterChange = (type: "all" | "pre" | "post" | "retencao") => {
    setFilterType(type);
    setCurrentPage(1);
  };

  return (
    <AppMainContainer title="Gestão de Avaliações">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Nivelamento Teórico</h1>
          <p className="text-sm text-gray-400 font-medium">Métricas de desempenho e retenção de conhecimento.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
            {["all", "pre", "retencao", "post"].map((type) => (
              <button 
                key={type}
                onClick={() => handleFilterChange(type as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === type ? "bg-[#4A0000] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"}`}
              >
                {type === "all" ? "Todos" : type === "pre" ? "Pré" : type === "retencao" ? "Retenção" : "Pós"}
              </button>
            ))}
          </div>

          <div className="w-40">
            <AppButton
              name="Criar Questões"
              form="round"
              type="solid"
              onClick={() => navigate("/admin/proof/createproof")}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-[24px] overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#4A0000]">
              <tr>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white rounded-tl-[24px]">Aluno</th>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white">Documento</th>
                <th className="p-5 text-center text-[11px] font-black uppercase tracking-widest text-white">Jornada</th>
                <th className="p-5 text-center text-[11px] font-black uppercase tracking-widest text-white">Nota Pré</th>
                <th className="p-5 text-center text-[11px] font-black uppercase tracking-widest text-white">Nota Pós</th>
                <th className="p-5 text-right text-[11px] font-black uppercase tracking-widest text-white rounded-tr-[24px]">Último Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-[#4A0000] font-black uppercase tracking-widest text-[10px]">
                    Sincronizando dados...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-500 font-medium">Nenhum registro localizado.</td>
                </tr>
              ) : (
                currentItems.map((s) => {
                  const status = getStatusJornada(s);
                  const temPre = s.notas && typeof s.notas.pre_teste === 'number';
                  const temPost = s.notas && typeof s.notas.pos_teste === 'number';

                  return (
                    <tr key={s.id} className="hover:bg-red-50/20 transition-colors group text-gray-700">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg text-gray-400 group-hover:text-[#4A0000] transition-colors">
                            <IoStatsChart size={16} />
                          </div>
                          <div>
                            <div className="font-bold">{s.nome_completo || "Sem Nome"}</div>
                            <div className="text-[10px] text-gray-400 font-medium uppercase">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-gray-400 font-mono text-xs italic">
                        {formatarCPF_LGPD(s.cpf)}
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border inline-flex items-center gap-1.5 ${status.cor}`}>
                          {status.type === "retencao" && <IoHourglassOutline size={12} />}
                          {status.label}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="inline-flex items-center gap-2 font-black">
                           <IoStatsChart className={temPre ? "text-[#4A0000]" : "text-gray-200"} size={14} />
                           {temPre ? s.notas.pre_teste.toFixed(1) : "--"}
                        </div>
                      </td>
                      <td className="p-5 text-center font-black text-[#4A0000] text-lg">
                        {temPost ? s.notas.pos_teste.toFixed(1) : "--"}
                      </td>
                      <td className="p-5 text-right text-gray-400 font-bold text-[11px] uppercase">
                        {s.data_nivelamento ? new Date(s.data_nivelamento).toLocaleDateString('pt-BR') : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

       
        {!loading && filteredResults.length > 0 && (
          <div className="p-6 bg-white flex items-center justify-between border-t border-gray-50">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Performance {indexOfFirstItem + 1} de {filteredResults.length}
            </p>
            <div className="flex gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${currentPage === 1 ? 'bg-gray-50 text-gray-200' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
              >
                <IoChevronBack size={20} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${currentPage === totalPages ? 'bg-gray-50 text-gray-200' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
              >
                <IoChevronForward size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppMainContainer>
  );
}