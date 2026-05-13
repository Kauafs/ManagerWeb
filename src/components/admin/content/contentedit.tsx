import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../../../firebaseConfig"; 
import { doc, getDoc, updateDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import AppButton from "../../../styles/button";
import AppMainContainer from "../../../styles/main";
import { IoAddCircle, IoTrash, IoCloudUpload } from "react-icons/io5";

interface Questao {
  pergunta: string;
  opcoes: string[];
  correta: number;
}

export default function ContentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [urlVideo, setUrlVideo] = useState("");
  const [urlImagem, setUrlImagem] = useState(""); 
  const [ordem, setOrdem] = useState("");
  const [moduloId, setModuloId] = useState("");
  const [modulos, setModulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [questoes, setQuestoes] = useState<Questao[]>([
    { pergunta: "", opcoes: ["", "", "", ""], correta: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qModulos = query(collection(db, "modulos"), orderBy("ordem", "asc"));
        const snapModulos = await getDocs(qModulos);
        setModulos(snapModulos.docs.map(d => ({ id: d.id, ...d.data() })));

        if (id) {
          const docRef = doc(db, "micromodulos", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitulo(data.titulo || "");
            setConteudo(data.descricao || data.conteudo || "");
            setUrlVideo(data.url_video || "");
            setUrlImagem(data.url_imagem || "");
            setOrdem(data.ordem?.toString() || "");
            setModuloId(data.moduloId || "");
            
            if (data.questoes && data.questoes.length > 0) {
              setQuestoes(data.questoes);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const adicionarQuestao = () => {
    setQuestoes([...questoes, { pergunta: "", opcoes: ["", "", "", ""], correta: 0 }]);
  };

  const removerQuestao = (index: number) => {
    setQuestoes(questoes.filter((_, i) => i !== index));
  };

  const atualizarQuestao = (index: number, campo: keyof Questao, valor: any) => {
    const novas = [...questoes];
    novas[index] = { ...novas[index], [campo]: valor };
    setQuestoes(novas);
  };

  const atualizarOpcao = (qIndex: number, oIndex: number, valor: string) => {
    const novas = [...questoes];
    novas[qIndex].opcoes[oIndex] = valor;
    setQuestoes(novas);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `aulas/${id}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUrlImagem(downloadURL);
      alert("Arquivo sincronizado com sucesso!");
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;
    const questoesValidas = questoes.filter(q => q.pergunta.trim() !== "");

    try {
      const docRef = doc(db, "micromodulos", id);
      await updateDoc(docRef, {
        titulo,
        descricao: conteudo,
        url_video: urlVideo,
        url_imagem: urlImagem,
        ordem: Number(ordem),
        moduloId,
        questoes: questoesValidas,
        updatedAt: new Date(),
      });
      alert("Conteúdo acadêmico atualizado!");
      navigate("/admin/content");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <AppMainContainer title="Editar Aula">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A0000]"></div>
          <p className="text-[#4A0000] font-black uppercase tracking-widest text-xs">Sincronizando Dados...</p>
        </div>
      </AppMainContainer>
    );
  }

  return (
    <AppMainContainer title="Editar AULA">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
        
        
        <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
             <div className="h-8 w-1.5 bg-[#4A0000] rounded-full" />
             <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Informações da Aula</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Título do Conteúdo</label>
              <input className="w-full border border-gray-200 p-4 rounded-xl bg-[#fbfbfb] outline-none focus:ring-2 focus:ring-red-50 font-bold transition-all text-gray-700" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">URL do Vídeo (Youtube/Vimeo)</label>
              <input className="w-full border border-gray-200 p-4 rounded-xl bg-[#fbfbfb] outline-none focus:ring-2 focus:ring-red-50 font-medium" value={urlVideo} onChange={(e) => setUrlVideo(e.target.value)} />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">
                {uploading ? "Sincronizando..." : "Trocar Imagem de Capa"}
              </label>
              <div className="relative">
                <input type="file" id="file-edit" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="file-edit" className="flex items-center justify-between w-full border border-gray-200 p-3.5 rounded-xl bg-[#fbfbfb] cursor-pointer hover:bg-red-50 transition-all">
                  <span className="text-xs font-bold text-gray-400">Selecionar novo arquivo...</span>
                  <IoCloudUpload size={20} className="text-[#4A0000]" />
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Texto Teórico da Aula</label>
              <textarea className="w-full border border-gray-200 p-4 rounded-xl bg-[#fbfbfb] min-h-[180px] resize-none outline-none focus:ring-2 focus:ring-red-50 font-medium transition-all" value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
            </div>
          </div>
        </div>

     
        <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10 border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-[#4A0000] rounded-full" />
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Editar Quiz</h3>
            </div>
            <button type="button" onClick={adicionarQuestao} className="flex items-center gap-2 bg-[#4A0000] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[2px] hover:scale-105 transition-all shadow-lg shadow-red-900/20 active:scale-95">
              <IoAddCircle size={18} /> Nova Questão
            </button>
          </div>

          <div className="space-y-16">
            {questoes.map((q, qIndex) => (
              <div key={qIndex} className="relative p-8 bg-gray-50/50 rounded-2xl border border-gray-100">
                <span className="absolute -top-4 left-6 bg-[#4A0000] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">Questão {qIndex + 1}</span>
                
                {questoes.length > 1 && (
                  <button onClick={() => removerQuestao(qIndex)} className="absolute -top-3 -right-3 text-white bg-[#4A0000] rounded-full shadow-lg p-2 hover:scale-110 transition-all">
                    <IoTrash size={18} />
                  </button>
                )}

                <div className="mb-8 mt-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Enunciado da Pergunta</label>
                  <textarea className="w-full border border-gray-200 rounded-xl p-4 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-red-50 transition-all resize-none min-h-[100px] font-medium" value={q.pergunta} onChange={(e) => atualizarQuestao(qIndex, "pergunta", e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {q.opcoes.map((opt, oIndex) => (
                    <div key={oIndex}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Alternativa {oIndex}</label>
                      <input className="w-full border border-gray-200 rounded-xl p-4 bg-white text-gray-600 outline-none focus:ring-2 focus:ring-red-50 transition-all font-medium" value={opt} onChange={(e) => atualizarOpcao(qIndex, oIndex, e.target.value)} />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-8">
                  <div>
                    <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Resposta Correta</label>
                    <select className="w-full border border-gray-200 rounded-xl p-4 bg-white outline-none focus:ring-2 focus:ring-red-50 font-bold text-gray-700" value={q.correta} onChange={(e) => atualizarQuestao(qIndex, "correta", Number(e.target.value))}>
                      {q.opcoes.map((_, i) => (
                        <option key={i} value={i}>Alternativa {i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 text-center">Posição Atual</label>
                    <div className="w-full p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-center font-black">{qIndex + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      
        <div className="flex items-center justify-end gap-4 px-2 mb-20 pt-4">
          <div className="w-44">
            <AppButton name="Cancelar" type="outline" form="round" onClick={() => navigate("/admin/content")} />
          </div>
          <div className="w-64">
            <AppButton 
              name={uploading ? "Aguarde..." : "Salvar Alterações"} 
              type="solid" 
              form="round" 
              onClick={handleUpdate} 
              disabled={uploading} 
            />
          </div>
        </div>
      </div>
    </AppMainContainer>
  );
}