import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import AppMainContainer from '../../../styles/main';
import AppButton from '../../../styles/button';
import { useNavigate } from 'react-router-dom';
import { IoAddCircleOutline, IoReaderOutline, IoListOutline } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';

interface Simulacao {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
  createdAt?: Timestamp;
}

const RegisterSimulacao = () => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ordem, setOrdem] = useState("");
  const [loading, setLoading] = useState(false);
  const [cenarios, setCenarios] = useState<Simulacao[]>([]);
  const navigate = useNavigate();

  
  useEffect(() => {
    const q = query(collection(db, "simulacoes"), orderBy("ordem", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      } as Simulacao));
      setCenarios(dados);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateScenario = async () => {
    if (!titulo || !ordem || !descricao) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "simulacoes"), {
        titulo: titulo, 
        descricao: descricao,
        ativo: true,
        ordem: Number(ordem),
        questoes: [],
        createdAt: serverTimestamp(),
      });

      alert("Cenário de simulação criado com sucesso!");
      setTitulo("");
      setOrdem("");
      setDescricao("");
      
    } catch (error) {
      console.error("Erro ao criar cenário:", error);
      alert("Falha ao salvar no banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente excluir o cenário: ${nome}?`)) {
      try {
        await deleteDoc(doc(db, "simulacoes", id));
        alert("Cenário removido com sucesso.");
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao tentar remover o cenário.");
      }
    }
  };

  return (
    <AppMainContainer title="Gestão de Simulações">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-10 pb-20">
    
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#4A0000] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoAddCircleOutline className="text-white" size={24} />
              <h2 className="text-white font-black uppercase tracking-widest text-sm">Novo Cenário Clínico</h2>
            </div>
            <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
               Simulação Mobile
            </span>
          </div>

          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div className="md:col-span-3 group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 transition-colors group-focus-within:text-[#4A0000]">
                  <IoReaderOutline size={14} /> Identificação do Cenário
                </label>
                <input 
                  className="w-full border border-gray-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] transition-all text-gray-700 font-bold placeholder:font-normal"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: PCR em Ambiente Extra-Hospitalar"
                />
              </div>

              <div className="md:col-span-1 group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 transition-colors group-focus-within:text-[#4A0000]">
                  <IoListOutline size={14} /> Sequência
                </label>
                <input 
                  type="number"
                  className="w-full border border-gray-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] transition-all text-gray-700 text-center font-black"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value)}
                  placeholder="1"
                />
              </div>

              <div className="md:col-span-4 group">
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 transition-colors group-focus-within:text-[#4A0000]">
                  Contexto e Briefing para o Aluno
                </label>
                <textarea 
                  rows={4}
                  className="w-full border border-gray-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] transition-all text-gray-700 resize-none font-medium leading-relaxed"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva detalhadamente a situação clínica..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <div className="w-44">
                <AppButton 
                  name="Voltar" 
                  form="round" 
                  type="outline" 
                  onClick={() => navigate("/admin/simulacao")} 
                />
              </div>
              <div className="w-64">
                <AppButton 
                  name={loading ? "Sincronizando..." : "Publicar Cenário"} 
                  form="round" 
                  type="solid" 
                  onClick={handleCreateScenario} 
                />
              </div>
            </div>
          </div>
        </div>

     
        <div className="space-y-4">
          <h3 className="text-[#4A0000] font-black uppercase tracking-widest text-xs ml-2">Cenários Publicados</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {cenarios.map((cen) => (
              <div key={cen.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-red-100 transition-all">
                <div className="flex items-center gap-6">
                  <div className="bg-red-50 text-[#4A0000] w-12 h-12 rounded-2xl flex items-center justify-center font-black">
                    {cen.ordem}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase text-sm">{cen.titulo}</h4>
                    <p className="text-gray-400 text-xs line-clamp-1">{cen.descricao}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(cen.id, cen.titulo)}
                  className="p-4 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
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
};

export default RegisterSimulacao;