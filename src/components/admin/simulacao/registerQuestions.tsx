import { useState, useEffect } from "react";
import { db, storage } from "../../../../firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useLocation, useNavigate } from "react-router-dom";
import AppMainContainer from "../../../styles/main";
import AppButton from "../../../styles/button";
import { IoCloudUploadOutline, IoLayersOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaTrash, FaEdit } from "react-icons/fa";
interface Question {
  pergunta: string;
  imagem: string;
  opcoes: string[];
  correta: number;
}

interface SimulationQuestionForm {
  pergunta: string;
  imagem: string;
  op0: string;
  op1: string;
  op2: string;
  op3: string;
  respostacorreta: number;
}

interface SimulacaoOption {
  id: string;
  titulo: string;
  questoes?: Question[];
}

export default function CadastrarQuestaoSimulacao() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { id: idVindoDoState } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [simulacoes, setSimulacoes] = useState<SimulacaoOption[]>([]);
  const [selectedSimulacaoId, setSelectedSimulacaoId] = useState(idVindoDoState || "");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [form, setForm] = useState<SimulationQuestionForm>({
    pergunta: "",
    imagem: "",
    op0: "",
    op1: "",
    op2: "",
    op3: "",
    respostacorreta: 0,
  });

  useEffect(() => {
    const q = query(collection(db, "simulacoes"), orderBy("titulo", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SimulacaoOption[];
      setSimulacoes(lista);
    });
    return () => unsubscribe();
  }, []);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSimulacaoId) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `simulacoes/${selectedSimulacaoId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setForm({ ...form, imagem: downloadURL });
    } catch (error) {
      alert("Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSimulacaoId || !form.pergunta || !form.imagem) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const simulacaoRef = doc(db, "simulacoes", selectedSimulacaoId);
      const novaQuestao = {
        pergunta: form.pergunta,
        imagem: form.imagem,
        opcoes: [form.op0, form.op1, form.op2, form.op3],
        correta: Number(form.respostacorreta),
      };

      if (editingQuestion) {
        await updateDoc(simulacaoRef, { questoes: arrayRemove(editingQuestion) });
      }

      await updateDoc(simulacaoRef, { questoes: arrayUnion(novaQuestao) });
      
      alert(editingQuestion ? "Questão atualizada!" : "Questão salva!");
      resetForm();
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setForm({
      pergunta: q.pergunta,
      imagem: q.imagem,
      op0: q.opcoes[0],
      op1: q.opcoes[1],
      op2: q.opcoes[2],
      op3: q.opcoes[3],
      respostacorreta: q.correta,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (q: Question) => {
    if (!window.confirm("Excluir esta questão?")) return;
    try {
      const simulacaoRef = doc(db, "simulacoes", selectedSimulacaoId);
      await updateDoc(simulacaoRef, { questoes: arrayRemove(q) });
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setForm({ pergunta: "", imagem: "", op0: "", op1: "", op2: "", op3: "", respostacorreta: 0 });
  };

  const currentSimulacao = simulacoes.find(s => s.id === selectedSimulacaoId);

  return (
    <AppMainContainer title="Gestão de Questões">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
        
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#4A0000] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoLayersOutline className="text-white" size={24} />
              <h2 className="text-white font-black uppercase tracking-widest text-sm">
                {editingQuestion ? "Editando Questão" : "Nova Questão de Simulação"}
              </h2>
            </div>
            <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Fluxo Mobile / Simulado
            </span>
          </div>

          <div className="p-10 space-y-10">
            <div className="group">
              <label className="flex items-center gap-2 text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">
                 Cenário de Destino
              </label>
              <select 
                className="w-full p-5 bg-[#fbfbfb] border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 font-black text-gray-700 transition-all appearance-none"
                value={selectedSimulacaoId}
                onChange={(e) => { setSelectedSimulacaoId(e.target.value); resetForm(); }}
              >
                <option value="">Selecione o cenário clínico...</option>
                {simulacoes.map((sim) => (
                  <option key={sim.id} value={sim.id}>{sim.titulo}</option>
                ))}
              </select>
            </div>

            <hr className="border-gray-50" />

            <div className="group">
              <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 transition-colors group-focus-within:text-[#4A0000]">
                <IoChatbubbleEllipsesOutline size={14} /> Descrição da Pergunta
              </label>
              <textarea 
                className="w-full p-5 bg-[#fbfbfb] border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 transition-all min-h-[120px] font-medium text-gray-700"
                placeholder="Descreva o cenário que aparecerá no aplicativo..."
                value={form.pergunta}
                onChange={(e) => setForm({ ...form, pergunta: e.target.value })}
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">
                Imagem de Apoio
              </label>
              
              <label className="relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-[24px] bg-[#fbfbfb] cursor-pointer hover:border-red-100 transition-all overflow-hidden group/upload">
                {form.imagem ? (
                  <img src={form.imagem} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <IoCloudUploadOutline className="text-[#A38D8D] mb-4" size={42} />
                    <p className="text-[10px] font-black text-[#8E9EB0] uppercase tracking-widest">
                      {uploading ? "Sincronizando..." : "Clique para fazer upload"}
                    </p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Alternativa {idx}</label>
                  <input 
                    type="text"
                    className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 font-medium transition-all"
                    placeholder={`Texto da opção ${idx}`}
                    value={(form as any)[`op${idx}`]}
                    onChange={(e) => setForm({ ...form, [`op${idx}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="max-w-sm pt-4">
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Resposta Correta (Gabarito)</label>
              <select 
                className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50 font-black text-gray-700 appearance-none"
                value={form.respostacorreta}
                onChange={(e) => setForm({ ...form, respostacorreta: Number(e.target.value) })}
              >
                {[0,1,2,3].map(v => <option key={v} value={v}>Alternativa {v}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 px-2">
          <div className="w-40">
            <AppButton name={editingQuestion ? "Cancelar" : "Descartar"} form="round" type="outline" onClick={editingQuestion ? resetForm : () => navigate("/admin/simulacao")} />
          </div>
          <div className="w-72">
            <AppButton name={loading ? "Publicando..." : editingQuestion ? "Salvar Alterações" : "Publicar Questão Mobile"} form="round" type="solid" onClick={handleSave} />
          </div>
        </div>


        {currentSimulacao?.questoes && currentSimulacao.questoes.length > 0 && (
          <div className="space-y-4">
             <h3 className="text-[#4A0000] font-black uppercase tracking-widest text-xs ml-2">Questões Registradas</h3>
             <div className="grid grid-cols-1 gap-4">
                {currentSimulacao.questoes.map((q, index) => (
                  <div key={index} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-red-100 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="bg-red-50 text-[#4A0000] w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border border-red-100/50">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{q.pergunta}</h4>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                          Resposta Correta: {q.correta}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(q)} className="p-3 text-gray-300 hover:text-blue-600 transition-colors"><FaEdit size={18}/></button>
                      <button onClick={() => handleDelete(q)} className="p-3 text-gray-300 hover:text-red-600 transition-colors"><FaTrash size={18}/></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </AppMainContainer>
  );
}