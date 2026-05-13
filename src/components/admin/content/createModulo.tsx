import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../firebaseConfig";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc,Timestamp } from "firebase/firestore";
import AppButton from "../../../styles/button";
import AppMainContainer from "../../../styles/main";
import { IoAddCircleOutline, IoReaderOutline, IoListOutline, IoInformationCircleOutline, } from 'react-icons/io5';

import { FaTrash } from "react-icons/fa";


interface Modulo {
  id: string;
  nome: string;
  ordem: number;
  descricao: string;
  createdAt?: Timestamp;
}

export default function ModuleCreatePage() {
  const [nome, setNome] = useState<string>("");
  const [ordem, setOrdem] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [modulos, setModulos] = useState<Modulo[]>([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "modulos"), orderBy("ordem", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      } as Modulo)); 
      setModulos(dados);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!nome || !ordem || !descricao) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "modulos"), {
        nome: nome,
        ordem: Number(ordem),
        descricao: descricao,
        createdAt: serverTimestamp(),
      });
      setNome(""); 
      setOrdem(""); 
      setDescricao(""); 
      alert("Módulo criado com sucesso!");
    } catch (e) {
      console.error("Erro ao salvar:", e);
      alert("Erro ao criar módulo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (window.confirm(`Deseja realmente excluir o módulo: ${titulo}?`)) {
      try {
        await deleteDoc(doc(db, "modulos", id));
        alert("Módulo removido com sucesso.");
      } catch (e) {
        console.error("Erro ao deletar:", e);
        alert("Erro ao tentar excluir o módulo.");
      }
    }
  };

  return (
    <AppMainContainer title="Gestão de Conteúdo Acadêmico">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
        
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#4A0000] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoAddCircleOutline className="text-white" size={24} />
              <h2 className="text-white font-black uppercase tracking-widest text-sm">Novo Módulo de Ensino</h2>
            </div>
          </div>

          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div className="md:col-span-3 group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-[#4A0000]">
                  <IoReaderOutline size={14} /> Título do Módulo
                </label>
                <input 
                  className="w-full border border-gray-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] transition-all text-gray-700 font-bold" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  placeholder="Ex: RCP em Crianças e Lactentes" 
                />
              </div>

              <div className="md:col-span-1 group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-[#4A0000]">
                  <IoListOutline size={14} /> Ordem
                </label>
                <input 
                  type="number" 
                  className="w-full border border-gray-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] transition-all text-gray-700 text-center font-black"
                  value={ordem} 
                  onChange={(e) => setOrdem(e.target.value)} 
                  placeholder="3" 
                />
              </div>

              <div className="md:col-span-4 group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-[#4A0000]">
                  <IoInformationCircleOutline size={14} /> Descrição
                </label>
                <textarea 
                  rows={4} 
                  className="w-full border border-gray-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] transition-all text-gray-700 resize-none font-medium"
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)} 
                  placeholder="Ex: Adaptações das manobras de ressuscitação..." 
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
                <div className="w-44">
                    <AppButton name="Cancelar" form="round" type="outline" onClick={() => navigate("/admin/content")} />
                </div>
                <div className="w-64">
                    <AppButton name={loading ? "Gravando..." : "Publicar Módulo"} form="round" type="solid" onClick={handleSave} />
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[#4A0000] font-black uppercase tracking-widest text-xs ml-2">Módulos Cadastrados</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {modulos.length === 0 ? (
              <p className="text-gray-400 text-xs italic ml-2">Nenhum módulo encontrado na coleção.</p>
            ) : modulos.map((mod) => (
              <div key={mod.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-red-100 transition-all">
                <div className="flex items-center gap-6">
                  <div className="bg-red-50 text-[#4A0000] w-12 h-12 rounded-2xl flex items-center justify-center font-black">
                    {mod.ordem}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase text-sm">{mod.nome}</h4>
                    <p className="text-gray-400 text-xs line-clamp-1">{mod.descricao}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(mod.id, mod.nome)}
                  className="p-4 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                  title="Excluir Módulo"
                >
                  <FaTrash size={18} /> 
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppMainContainer>
  );
}