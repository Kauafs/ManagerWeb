import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; 
import AppMainContainer from "../../../styles/main";
import { FaTrash, FaEdit, FaLock } from "react-icons/fa"; 
import { IoChevronBack, IoChevronForward, IoPerson } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

 
  const formatarCPF_LGPD = (cpf: string) => {
    if (!cpf) return "---";
    const clean = cpf.replace(/\D/g, "");
    return clean.length === 11 
      ? `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**` 
      : cpf;
  };

  const formatarCelular_LGPD = (cel: string) => {
    if (!cel) return "---";
    const clean = cel.replace(/\D/g, "");
    return clean.length >= 10 
      ? `(**) *****-${clean.slice(-4)}` 
      : cel;
  };

  useEffect(() => {
    const getStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const allData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
       
        const onlyStudents = allData.filter((user : any) => user.role !== "admin");
        setStudents(onlyStudents);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };
    getStudents();
  }, []);

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const currentStudents = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return;
    try {
      await deleteDoc(doc(db, "usuarios", id));
      setStudents((prev) => prev.filter((item) => item.id !== id));
      alert("Usuário removido com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const ref = doc(db, "usuarios", id);
      await updateDoc(ref, { status: newStatus });
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  return (
    <AppMainContainer title="Gestão de Alunos">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-black text-[22px] text-gray-800 uppercase tracking-tight">Alunos Cadastrados</h1>
          <p className="text-sm text-gray-400 font-medium">Visão geral de alunos cadastrados</p>
        </div>
        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
          <span className="text-xs font-black text-[#4A0000] uppercase tracking-widest">Total: {students.length} matriculados</span>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-[24px] overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#4A0000]">
              <tr>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white rounded-tl-[24px]">Nome do Aluno</th>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2"><FaLock size={10}/> CPF</th>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white">Curso / Vínculo</th>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white">Celular</th>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white">Status</th>
                <th className="p-5 text-center text-[11px] font-black uppercase tracking-widest text-white rounded-tr-[24px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A0000]"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#4A0000]">Sincronizando usuários...</span>
                    </div>
                  </td>
                </tr>
              ) : currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-500 font-medium">Nenhum aluno encontrado na base de dados.</td>
                </tr>
              ) : (
                currentStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-red-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg text-gray-400 group-hover:text-[#4A0000] transition-colors">
                          <IoPerson size={16} />
                        </div>
                        <span className="font-bold text-gray-700">{s.nome_completo || "Sem Nome"}</span>
                      </div>
                    </td>
                    <td className="p-5 text-gray-400 text-xs font-mono tracking-tighter italic">
                      {formatarCPF_LGPD(s.cpf)}
                    </td>
                    <td className="p-5">
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase">
                        {s.curso || "Não informado"}
                      </span>
                    </td>
                    <td className="p-5 text-gray-400 text-xs italic">
                      {formatarCelular_LGPD(s.celular)}
                    </td>
                    
                    <td className="p-5">
                      <select
                        value={s.status || "ativo"}
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                        className={`border rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none transition-all ${
                          s.status === "inativo" 
                          ? "bg-gray-100 text-gray-400 border-gray-200" 
                          : "bg-red-50 text-[#4A0000] border-red-100"
                        }`}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center gap-4">
                        <button 
                          className="text-[#4A0000] opacity-60 hover:opacity-100 hover:scale-125 transition-all" 
                          onClick={() => navigate(`/admin/registers/editregisters/${s.id}`)}
                          title="Editar Perfil"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          className="text-red-500 opacity-60 hover:opacity-100 hover:scale-125 transition-all" 
                          onClick={() => handleDelete(s.id)}
                          title="Remover Aluno"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
      
        {!loading && students.length > 0 && (
          <div className="p-6 bg-white flex items-center justify-between border-t border-gray-50">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Página <span className="text-gray-900">{currentPage}</span> de <span className="text-gray-900">{totalPages || 1}</span>
            </p>
            <div className="flex gap-3">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)} 
                className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${
                  currentPage === 1 
                  ? "bg-gray-50 text-gray-200 border-gray-100" 
                  : "border-gray-200 text-[#4A0000] hover:bg-red-50 active:scale-90"
                }`}
              >
                <IoChevronBack size={20} />
              </button>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)} 
                className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${
                  currentPage === totalPages 
                  ? "bg-gray-50 text-gray-200 border-gray-100" 
                  : "border-gray-200 text-[#4A0000] hover:bg-red-50 active:scale-90"
                }`}
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