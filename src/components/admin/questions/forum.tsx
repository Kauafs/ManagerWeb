import { useEffect, useState } from "react";
import { db } from "../../../../firebaseConfig";
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import AppMainContainer from "../../../styles/main";
import AppButton from "../../../styles/button"; 
import { FaTrash } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function ForumManager() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({}); 

   
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    const getQuestions = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "forum"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setQuestions(data);
        } catch (error) {
            console.error("Erro ao buscar pergunta:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getQuestions();
    }, []);

  
    const totalPages = Math.max(1, Math.ceil(questions.length / itemsPerPage));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = questions.slice(indexOfFirstItem, indexOfLastItem);

    const handleReply = async (id: string) => {
        const resposta = replyText[id];
        if (!resposta || resposta.trim() === "") 
            return alert("Digite uma resposta antes de enviar.");

        try {
            await updateDoc(doc(db, "forum", id), { 
                resposta: resposta,
                status: "Respondido",
                answeredAt: serverTimestamp()
            });
            alert("Resposta enviada com sucesso!");
            setReplyText({ ...replyText, [id]: "" }); 
            getQuestions(); 
        } catch (error) {
            alert("Erro ao responder questionamento.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Deseja realmente excluir este questionamento?")) {
            try {
                await deleteDoc(doc(db, "forum", id));
                getQuestions();
            } catch (error) {
                alert("Erro ao excluir");
            }
        }
    };

    return (
        <AppMainContainer title="Fórum de Dúvidas">
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
                
             
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Interações Acadêmicas</h1>
                        <p className="text-sm text-gray-400 font-medium text-left">Suporte pedagógico e respostas aos alunos.</p>
                    </div>
                    <div className="w-56">
                        <AppButton 
                            name="Atualizar" 
                            form="round" 
                            type="solid" 
                            onClick={getQuestions} 
                        />
                    </div>
                </div>

            
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-[#4A0000]">
                            <tr>
                                <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white rounded-tl-[24px]">Origem / Questionamento</th>
                                <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white">Status</th>
                                <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white">Orientação do Instrutor</th>
                                <th className="p-5 text-center text-[11px] font-black uppercase tracking-widest text-white rounded-tr-[24px]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A0000] mx-auto mb-3"></div>
                                        <span className="text-[10px] font-black text-[#4A0000] uppercase">Sincronizando fórum...</span>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-4">
                                            <FaTrash size={24}/>
                                        </div>
                                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Sem interações pendentes no momento.</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(q => (
                                    <tr key={q.id} className="hover:bg-red-50/20 transition-colors group">
                                        <td className="p-6 align-top max-w-[350px]">
                                            <p className="font-black text-[#4A0000] text-xs uppercase tracking-wider mb-2 text-left">{q.author || "Usuário Externo"}</p>
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-gray-700 text-sm leading-relaxed italic text-left">"{q.question}"</p>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-300 mt-4 uppercase tracking-[2px] text-left">
                                                Postado em: {q.createdAt?.seconds ? new Date(q.createdAt.seconds * 1000).toLocaleString('pt-BR') : "Processando..."}
                                            </p>
                                        </td>

                                        <td className="p-6 align-top">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                                q.status === 'Respondido' ? 'bg-red-50 text-[#4A0000]' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {q.status || "Pendente"}
                                            </span>
                                        </td>

                                        <td className="p-6 align-top min-w-[350px]">
                                            {q.status === "Respondido" ? (
                                                <div className="bg-white border border-[#4A0000]/10 p-5 rounded-2xl shadow-sm border-l-4 border-l-[#4A0000] text-left">
                                                    <p className="text-[10px] font-black text-[#4A0000] uppercase tracking-widest mb-2">Parecer enviado:</p>
                                                    <p className="text-sm text-gray-600 leading-snug font-medium">{q.resposta}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4">
                                                    <textarea 
                                                        className="w-full border border-gray-200 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] transition-all resize-none font-medium text-gray-700"
                                                        placeholder="Digite a resposta pedagógica para o aluno..."
                                                        rows={3}
                                                        value={replyText[q.id] || ""}
                                                        onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                                                    />
                                                    <div className="w-full">
                                                        <AppButton 
                                                            name="Publicar Resposta" 
                                                            form="round" 
                                                            type="solid" 
                                                            onClick={() => handleReply(q.id)} 
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-6 text-center align-top">
                                            <button 
                                                onClick={() => handleDelete(q.id)}
                                                className="text-red-500 opacity-40 hover:opacity-100 hover:scale-125 transition-all p-2 rounded-full hover:bg-red-50"
                                                title="Remover questionamento"
                                            >
                                                <FaTrash size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

               
                    {!loading && questions.length > 0 && (
                        <div className="p-6 bg-white flex items-center justify-between border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                Mostrando <span className="text-gray-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, questions.length)}</span> de {questions.length} interações
                            </p>
                            <div className="flex gap-3">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${currentPage === 1 ? 'bg-gray-50 text-gray-200 border-gray-100' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
                                >
                                    <IoChevronBack size={20} />
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${currentPage === totalPages ? 'bg-gray-50 text-gray-200 border-gray-100' : 'border-gray-200 text-[#4A0000] hover:bg-red-50'}`}
                                >
                                    <IoChevronForward size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppMainContainer>
    );
}