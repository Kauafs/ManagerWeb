import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebaseConfig";
import AppButton from "../../../styles/button";
import AppMainContainer from "../../../styles/main";
import { IoAddCircle, IoTrash, IoCloudUpload } from "react-icons/io5";

interface Questao {
  pergunta: string;
  opcoes: string[];
  correta: number;
}

export default function ContentCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [ordem, setOrdem] = useState(1);
  const [moduloId, setModuloId] = useState("");
  const [urlImagem, setUrlImagem] = useState(""); 
  const [uploading, setUploading] = useState(false); 
  
  const [questoes, setQuestoes] = useState<Questao[]>([
    { pergunta: "", opcoes: ["", "", "", ""], correta: 0 }
  ]);
  
  const [modulos, setModulos] = useState<any[]>([]);

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const q = query(collection(db, "modulos"), orderBy("ordem", "asc"));
        const snap = await getDocs(q);
        const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setModulos(lista);
        if (lista.length > 0) setModuloId(lista[0].id);
      } catch (error) {
        console.error("Erro ao buscar módulos:", error);
      }
    };
    fetchModulos();
  }, []);

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
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `aulas/uploads/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUrlImagem(downloadURL);
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!moduloId) return alert("Selecione um Módulo.");
    const questoesValidas = questoes.filter(q => q.pergunta.trim() !== "");

    try {
      await addDoc(collection(db, "micromodulos"), {
        titulo: title,
        descricao: description,
        url_video: videoUrl,
        url_imagem: urlImagem, 
        ordem: Number(ordem),
        moduloId: moduloId, 
        questoes: questoesValidas,
        data_criacao: serverTimestamp(),
      });
      alert("Aula com Quiz publicada!");
      navigate("/admin/content");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <AppMainContainer title="Novo Conteúdo Acadêmico">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
        
        <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
             <div className="h-8 w-1.5 bg-[#4A0000] rounded-full" />
             <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Dados da Aula</h3>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Vincular ao Módulo</label>
              <select className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 transition-all font-bold text-gray-700" value={moduloId} onChange={(e) => setModuloId(e.target.value)}>
                {modulos.map((m) => (
                  <option key={m.id} value={m.id}>{m.ordem}° - {m.nome}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Título da Aula</label>
              <input className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 transition-all font-medium" value={title} placeholder="Ex: Introdução ao BLS" onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Link do Vídeo (URL)</label>
              <input className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 transition-all font-medium" value={videoUrl} placeholder="Ex: https://youtube.com/..." onChange={(e) => setVideoUrl(e.target.value)} />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Ordem na lista</label>
              <input type="number" className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 transition-all font-black text-center" value={ordem} onChange={(e) => setOrdem(Number(e.target.value))} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Descrição Teórica</label>
              <textarea rows={5} className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 transition-all resize-none font-medium" value={description} placeholder="Insira aqui o conteúdo teórico que aparecerá no App..." onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Imagem de Apoio</label>
              <div className="relative group">
                <input type="file" id="file-upload" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-[152px] border-2 border-dashed border-gray-200 rounded-xl bg-[#fbfbfb] cursor-pointer group-hover:border-[#4A0000] group-hover:bg-red-50/30 transition-all">
                  {urlImagem ? (
                    <img src={urlImagem} alt="Preview" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <IoCloudUpload size={32} className="text-[#4A0000] opacity-40 group-hover:opacity-100" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clique para fazer upload</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10 border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-[#4A0000] rounded-full" />
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Adicionar Questões</h3>
            </div>
            
            <button 
              type="button"
              onClick={adicionarQuestao}
              className="flex items-center gap-2 bg-[#4A0000] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[2px] hover:scale-105 transition-all shadow-lg shadow-red-900/20 active:scale-95"
            >
              <IoAddCircle size={18} /> Nova Questão
            </button>
          </div>

          <div className="space-y-16">
            {questoes.map((q, qIndex) => (
              <div key={qIndex} className="relative p-8 rounded-2xl bg-gray-50/50 border border-gray-100">
                <span className="absolute -top-4 left-6 bg-[#4A0000] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Questão {qIndex + 1}</span>
                
                {questoes.length > 1 && (
                  <button 
                    onClick={() => removerQuestao(qIndex)}
                    className="absolute -top-3 -right-3 text-white bg-[#4A0000] shadow-md rounded-full p-2 hover:scale-110 transition-all"
                  >
                    <IoTrash size={18} />
                  </button>
                )}

                <div className="mb-8 mt-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Enunciado da Pergunta</label>
                  <textarea 
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 transition-all min-h-[100px] font-medium"
                    value={q.pergunta}
                    onChange={(e) => atualizarQuestao(qIndex, "pergunta", e.target.value)}
                    placeholder="Qual o procedimento correto para..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {q.opcoes.map((opt, oIndex) => (
                    <div key={oIndex}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Opção {oIndex}</label>
                      <input 
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 transition-all font-medium"
                        value={opt}
                        onChange={(e) => atualizarOpcao(qIndex, oIndex, e.target.value)}
                        placeholder={`Resposta da alternativa ${oIndex}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Índice da Resposta Correta</label>
                    <select 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 font-bold text-gray-700"
                      value={q.correta}
                      onChange={(e) => atualizarQuestao(qIndex, "correta", Number(e.target.value))}
                    >
                      {q.opcoes.map((_, i) => (
                        <option key={i} value={i}>Alternativa {i}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-48">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 text-center">Posição Quiz</label>
                    <div className="w-full p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-center font-black">{qIndex + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

   
        <div className="flex items-center justify-end gap-4 border-t pt-10">
          <div className="w-44">
            <AppButton name="Descartar" form="round" type="outline" onClick={() => navigate("/admin/content")} />
          </div>
          <div className="w-72">
            <AppButton 
              name={uploading ? "Sincronizando Arquivos..." : "Publicar Aula "} 
              form="round" 
              type="solid" 
              onClick={handleSave} 
              disabled={uploading} 
            />
          </div>
        </div>
      </div>
    </AppMainContainer>
  );
}