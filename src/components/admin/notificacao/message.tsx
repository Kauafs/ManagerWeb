import { useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig'; 
import { collection, query, onSnapshot, Timestamp, where, getDocs, limit, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import AppMainContainer from '../../../styles/main';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../../styles/button';
import emailjs from '@emailjs/browser';
import { IoMailOpenOutline, IoCheckmarkDoneOutline,IoChevronBack,IoChevronForward} from 'react-icons/io5';

interface LogNotificacao {
  id: string;
  nome: string;
  cpf: string;
  status_email: string;
  email_aluno?: string; 
  data_conclusao?: Timestamp;
  agendamento_presencial?: {
    data: string;
    hora: string;
    local: string;
    enviado_em: Timestamp;
  };
}

const NotificacaoEmail = () => {
  const [logs, setLogs] = useState<LogNotificacao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LogNotificacao | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  
  // PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [dataPresencial, setDataPresencial] = useState('');
  const [horaPresencial, setHoraPresencial] = useState('');
  const [localPresencial, setLocalPresencial] = useState('Laboratório de Habilidades Médicas - Bloco A');

  const navigate = useNavigate();

  const SERVICE_ID = 'CADASTRE A SUA ;)';
  const TEMPLATE_ID_AGENDAMENTO = 'CADASTRE A SUA ;)';
  const PUBLIC_KEY = 'CADASTRE A SUA ;)';

  const formatarCPF_LGPD = (cpf: string) => {
    if (!cpf) return "---";
    const clean = cpf.replace(/\D/g, "");
    return clean.length === 11 
      ? `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**` 
      : cpf;
  };

  useEffect(() => {
    const q = query(collection(db, "resultados_simulacao"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsAgrupados: Record<string, LogNotificacao> = {};

      querySnapshot.docs.forEach((doc) => {
        const dados = doc.data();
        const cpfKey = dados.cpf || doc.id;

        if (!logsAgrupados[cpfKey]) {
          logsAgrupados[cpfKey] = {
            id: doc.id,
            nome: dados.nome || "Usuário Desconhecido",
            cpf: cpfKey,
            status_email: dados.status_email || "Pendente",
            data_conclusao: dados.data_conclusao,
            agendamento_presencial: dados.agendamento_presencial 
          };
        }
      });

      setLogs(Object.values(logsAgrupados));
    });

    return () => unsubscribe();
  }, []);

 
  const totalPages = Math.max(1, Math.ceil(logs.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenModal = async (log: LogNotificacao) => {
    setLoadingModal(true);
    try {
      const q = query(collection(db, "usuarios"), where("cpf", "==", log.cpf), limit(1));
      const userSnap = await getDocs(q);

      if (!userSnap.empty) {
        const emailEncontrado = userSnap.docs[0].data().email;
        setSelectedUser({
          ...log,
          email_aluno: emailEncontrado
        });
        setShowModal(true);
      } else {
        alert("Erro: E-mail não encontrado na base de usuários.");
      }
    } catch (error) {
      console.error("Erro ao buscar e-mail:", error);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleEnviarAgendamento = async () => {
    if (!selectedUser?.email_aluno || !dataPresencial || !horaPresencial || !localPresencial) {
      alert("Preencha todos os campos antes de enviar.");
      return;
    }

    try {
      const templateParams = {
        name: selectedUser.nome,
        to_email: selectedUser.email_aluno,
        data_evento: dataPresencial,
        hora_evento: horaPresencial,
        local_evento: localPresencial,
        message: `Olá ${selectedUser.nome}, sua simulação presencial de Suporte Básico de Vida foi agendada para o dia ${dataPresencial} às ${horaPresencial}. Local: ${localPresencial}.` 
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID_AGENDAMENTO, templateParams, PUBLIC_KEY);

      const logRef = doc(db, "resultados_simulacao", selectedUser.id);
      await updateDoc(logRef, {
        status_email: "Agendado",
        agendamento_presencial: {
          data: dataPresencial,
          hora: horaPresencial,
          local: localPresencial,
          enviado_em: serverTimestamp()
        }
      });

      alert(`Convite enviado com sucesso para ${selectedUser.email_aluno}`);
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
      alert("Falha ao processar o envio.");
    }
  };

  return (
    <AppMainContainer title='Notificações de Sistema'>
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase">Convocação Prática</h2>
          <p className="text-sm text-gray-400 font-medium italic">Agendamento para simulação presencial</p>
        </div>
        <div className="w-44">
          <AppButton name='Voltar' form='round' type='solid' onClick={() => navigate('/admin/dashboard/')} />
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-[#4A0000]">
            <tr>
              <th className="p-6 text-white font-black uppercase tracking-widest text-[11px] text-left">Aluno / Identificação</th>
              <th className="p-6 text-white font-black uppercase tracking-widest text-[11px] text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentLogs.map((log) => (
              <tr key={log.id} className="hover:bg-red-50/20 transition-colors group">
                <td className="p-6 text-left">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-400 group-hover:text-[#4A0000] transition-colors">
                      <IoMailOpenOutline size={16} />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-black text-gray-700 uppercase text-sm mb-1">{log.nome}</p>
                      <span className="text-[10px] text-gray-400 font-mono italic">
                        CPF: {formatarCPF_LGPD(log.cpf)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-right">
                  {log.status_email === "Agendado" && log.agendamento_presencial ? (
                    <div className="flex flex-col items-end bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl min-w-[220px]">
                      <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
                        <IoCheckmarkDoneOutline size={16} />
                        <span className="text-[9px] font-black uppercase">Convite Enviado</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-gray-500 font-bold text-[10px]">
                        <span>{log.agendamento_presencial.data} às {log.agendamento_presencial.hora}</span>
                        <span className="text-[9px] text-gray-400 italic font-medium">{log.agendamento_presencial.local}</span>
                      </div>
                      <button onClick={() => handleOpenModal(log)} className="mt-2 text-[9px] text-[#4A0000] underline font-black">REAGENDAR</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleOpenModal(log)}
                      className="bg-red-50 text-[#4A0000] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#4A0000] hover:text-white transition-all"
                    >
                      Agendar Prática
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {logs.length > 0 && (
          <div className="p-6 bg-white flex items-center justify-between border-t border-gray-50">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Performance {indexOfFirstItem + 1} de {logs.length}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#4A0000]" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[#4A0000] uppercase">Agendar Treinamento</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-300">&times;</button>
            </div>
            <div className="bg-[#fbfbfb] p-5 rounded-2xl mb-6 border border-gray-100">
              <p className="text-base font-black text-gray-800 uppercase">{selectedUser?.nome}</p>
              <p className="text-xs text-[#4A0000]">{selectedUser?.email_aluno}</p>
            </div>
            <div className="space-y-4">
              <input type="date" className="w-full border border-gray-200 rounded-xl p-4 bg-[#fbfbfb]" value={dataPresencial} onChange={(e) => setDataPresencial(e.target.value)} />
              <input type="time" className="w-full border border-gray-200 rounded-xl p-4 bg-[#fbfbfb]" value={horaPresencial} onChange={(e) => setHoraPresencial(e.target.value)} />
              <input type="text" placeholder="Local da Prática" className="w-full border border-gray-200 rounded-xl p-4 bg-[#fbfbfb] font-bold text-gray-700" value={localPresencial} onChange={(e) => setLocalPresencial(e.target.value)} />
            </div>
            <div className="flex gap-4 mt-8">
              <button className="flex-1 py-4 text-[11px] font-black uppercase text-gray-400" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="flex-[2] py-4 bg-[#4A0000] text-white text-[11px] font-black uppercase rounded-2xl shadow-lg" onClick={handleEnviarAgendamento}>Confirmar e Enviar</button>
            </div>
          </div>
        </div>
      )}
    </AppMainContainer>
  );
};

export default NotificacaoEmail;