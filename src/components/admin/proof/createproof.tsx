import { useState, useEffect } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; 
import AppMainContainer from "../../../styles/main";
import AppButton from "../../../styles/button";
import { useNavigate } from "react-router-dom";
import { IoAlertCircle, IoListOutline } from "react-icons/io5";
import { FaTrash, FaEdit } from "react-icons/fa";

interface QuestionForm {
  id?: string;
  pergunta: string;
  op0: string;
  op1: string;
  op2: string;
  op3: string;
  respostacorreta: number;
  ordem: number;
  tipoAvaliacao: "nivelamento" | "conclusao";
  erroCritico: boolean; 
}

export default function CreateProof() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [form, setForm] = useState<QuestionForm>({
    pergunta: "",
    op0: "",
    op1: "",
    op2: "",
    op3: "",
    respostacorreta: 0,
    ordem: 1,
    tipoAvaliacao: "nivelamento",
    erroCritico: false,
  });

  useEffect(() => {
    const targetColl = form.tipoAvaliacao === "conclusao" ? "avaliacoes_pos" : "avaliacoes";
    const q = query(collection(db, targetColl), orderBy("ordem", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => {
        const docData = d.data();
        return {
          id: d.id,
          pergunta: docData.pergunta,
          op0: docData.opcoes[0],
          op1: docData.opcoes[1],
          op2: docData.opcoes[2],
          op3: docData.opcoes[3],
          respostacorreta: docData.respostacorreta,
          ordem: docData.ordem,
          tipoAvaliacao: form.tipoAvaliacao,
          erroCritico: docData.erroCritico || false
        };
      });
      setQuestions(data);
    });

    return () => unsubscribe();
  }, [form.tipoAvaliacao]);

  const handleSave = async () => {
    if (!form.pergunta || !form.op0 || !form.op1) {
      alert("Por favor, preencha a pergunta e pelo menos duas opções.");
      return;
    }

    setLoading(true);
    try {
      const colecaoDestino = form.tipoAvaliacao === "conclusao" ? "avaliacoes_pos" : "avaliacoes";
      const payload = {
        pergunta: form.pergunta, 
        opcoes: [form.op0, form.op1, form.op2, form.op3],
        respostacorreta: Number(form.respostacorreta),
        tipo: form.tipoAvaliacao,
        ordem: Number(form.ordem),
        erroCritico: form.erroCritico,
        moduloid: "",
      };

      if (isEditing && form.id) {
        await updateDoc(doc(db, colecaoDestino, form.id), payload);
        alert("Questão atualizada!");
      } else {
        await addDoc(collection(db, colecaoDestino), payload);
        alert("Questão cadastrada!");
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao processar operação.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta questão?")) {
      const targetColl = form.tipoAvaliacao === "conclusao" ? "avaliacoes_pos" : "avaliacoes";
      await deleteDoc(doc(db, targetColl, id));
    }
  };

  const handleEdit = (q: QuestionForm) => {
    setForm(q);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({
      pergunta: "",
      op0: "",
      op1: "",
      op2: "",
      op3: "",
      respostacorreta: 0,
      ordem: questions.length + 1,
      tipoAvaliacao: form.tipoAvaliacao,
      erroCritico: false,
    });
    setIsEditing(false);
  };

  return (
    <AppMainContainer title="Gestão de Avaliações">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
        
        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#4A0000] p-6 flex items-center justify-between">
            <h2 className="text-white font-black uppercase tracking-widest text-sm">
                {isEditing ? "Editando Questão" : "Configuração da Questão"}
            </h2>
            <button 
                onClick={() => document.getElementById('lista-questoes')?.scrollIntoView({behavior: 'smooth'})}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest transition-all flex items-center gap-2"
            >
                <IoListOutline size={14} /> Ver questões ({questions.length})
            </button>
          </div>

          <div className="p-10 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-4">Finalidade Acadêmica</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" className="w-5 h-5 accent-[#4A0000]" checked={form.tipoAvaliacao === "nivelamento"} onChange={() => setForm({...form, tipoAvaliacao: "nivelamento", erroCritico: false})}/>
                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#4A0000]">Pré-Teste</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" className="w-5 h-5 accent-[#4A0000]" checked={form.tipoAvaliacao === "conclusao"} onChange={() => setForm({...form, tipoAvaliacao: "conclusao"})}/>
                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#4A0000]">Pós-Teste</span>
                  </label>
                </div>
              </div>

              {form.tipoAvaliacao === "conclusao" && (
                <div className="md:w-72 bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input type="checkbox" className="w-6 h-6 accent-[#4A0000]" checked={form.erroCritico} onChange={(e) => setForm({...form, erroCritico: e.target.checked})}/>
                    <div>
                      <span className="flex items-center gap-1 text-sm font-black text-[#4A0000] uppercase"><IoAlertCircle size={16} /> Erro Crítico</span>
                      <span className="text-[10px] text-[#4A0000]/60 font-bold leading-tight italic">Reprova imediatamente</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Enunciado</label>
              <textarea className="w-full p-5 bg-[#fbfbfb] border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-50 min-h-[100px] font-medium" value={form.pergunta} onChange={(e) => setForm({ ...form, pergunta: e.target.value })}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Alternativa {idx}</label>
                  <input type="text" className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-50" value={(form as any)[`op${idx}`]} onChange={(e) => setForm({ ...form, [`op${idx}`]: e.target.value })}/>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
              <div>
                <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3">Gabarito (Correta)</label>
                <select className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl font-black text-gray-700" value={form.respostacorreta} onChange={(e) => setForm({ ...form, respostacorreta: Number(e.target.value) })}>
                  {[0,1,2,3].map(v => <option key={v} value={v}>Alternativa {v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Ordem de Exibição</label>
                <input type="number" className="w-full p-4 bg-[#fbfbfb] border border-gray-200 rounded-xl font-black text-center" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}/>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="w-40">
            <AppButton name={isEditing ? "Cancelar Edição" : "Descartar"} form="round" type="outline" onClick={isEditing ? resetForm : () => navigate("/admin/proof")}/>
          </div>
          <div className="w-72">
            <AppButton name={loading ? "Sincronizando..." : (isEditing ? "Salvar Alterações" : "Publicar Questão")} form="round" type="solid" onClick={handleSave}/>
          </div>
        </div>

        <div id="lista-questoes" className="mt-10 space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[#4A0000] font-black uppercase tracking-widest text-xs">Questões do {form.tipoAvaliacao === 'nivelamento' ? 'Pré-Teste' : 'Pós-Teste'}</h3>
                <span className="text-[10px] text-gray-400 font-bold italic">Total de {questions.length} itens</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {questions.map((q) => (
                    <div key={q.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-red-100 transition-all">
                        <div className="flex items-center gap-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${q.erroCritico ? 'bg-red-600 text-white' : 'bg-red-50 text-[#4A0000]'}`}>
                                {q.ordem}
                            </div>
                            <div className="max-w-2xl">
                                <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{q.pergunta}</h4>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Resposta Correta: {q.respostacorreta}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(q)} className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <FaEdit size={18} />
                            </button>
                            <button onClick={() => q.id && handleDelete(q.id)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                <FaTrash size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </AppMainContainer>
  );
}