import AppButton from "../../../styles/button";
import { useNavigate } from "react-router-dom";
import AppMainContainer from "../../../styles/main";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"; 
import { db } from "../../../../firebaseConfig";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function ContentPage() {
  const navigate = useNavigate();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modulosMap, setModulosMap] = useState<Record<string, string>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const modulosSnap = await getDocs(collection(db, "modulos"));
        const nomesMap: Record<string, string> = {};
        modulosSnap.forEach((doc) => {
          nomesMap[doc.id] = doc.data().nome; 
        });
        setModulosMap(nomesMap);

        const q = query(
          collection(db, "micromodulos"), 
          orderBy("moduloId", "asc"), 
          orderBy("ordem", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContents(data);
      } catch (error: any) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const totalPages = Math.ceil(contents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = contents.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja excluir esta aula?")) return;
    try {
      await deleteDoc(doc(db, "micromodulos", id));
      setContents((prev) => prev.filter((item) => item.id !== id));
      alert("Aula excluída com sucesso!");
    } catch (error) {
      console.log("Erro ao excluir conteúdo:", error);
    }
  };

  return (
    <AppMainContainer title="Gestão Acadêmica">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-black text-[22px] text-gray-800 uppercase tracking-tight">Aulas (Micromódulos)</h1>
          <p className="text-sm text-gray-400 font-medium">Organização pedagógica por módulos e sequência.</p>
        </div>

        <div className="flex gap-3">
          <AppButton
            name="Criar Módulo"
            form="round"
            type="outline"
            onClick={() => navigate("/admin/content/createModulo")}
          />
          <AppButton
            name="Criar Aula"
            form="round"
            type="solid"
            onClick={() => navigate("/admin/content/contentcreate")}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-[24px] overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#4A0000]">
              <tr>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white rounded-tl-[24px]">Posição</th>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white">Conteúdo Acadêmico</th>
                <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-white">Módulo Relacionado</th>
                <th className="p-5 text-center text-[11px] font-black uppercase tracking-widest text-white rounded-tr-[24px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col justify-center items-center gap-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A0000]"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#4A0000]">Sincronizando...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="p-5">
                      <span className="font-black text-[#4A0000] bg-red-50 px-3 py-1.5 rounded-xl text-xs">{item.ordem || 0}º</span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{item.titulo}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-1 truncate w-64 italic">{item.url_video || 'Sem vídeo'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase border border-gray-200">
                        {modulosMap[item.moduloId] || `ID: ${item.moduloId}`}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-5">
                      
                        <button className="text-[#4A0000] hover:scale-125 transition-all opacity-80 hover:opacity-100" title="Visualizar">
                          <FaEye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 hover:scale-125 transition-all opacity-80 hover:opacity-100" 
                          title="Editar"
                          onClick={() => navigate(`/admin/content/edit/${item.id}`)}
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:scale-125 transition-all opacity-80 hover:opacity-100"
                          onClick={() => handleDelete(item.id)}
                          title="Excluir"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && contents.length > 0 && (
          <div className="p-6 bg-white flex items-center justify-between border-t border-gray-50">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Página <span className="text-gray-900">{currentPage}</span> de <span className="text-gray-900">{totalPages}</span>
            </p>
            <div className="flex gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border ${currentPage === 1 ? 'bg-gray-50 text-gray-200' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
              >
                <IoChevronBack size={20} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border ${currentPage === totalPages ? 'bg-gray-50 text-gray-200' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
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