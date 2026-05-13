import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import AppMainContainer from "../../../styles/main";
import AppButton from "../../../styles/button";

interface Student {
  cpf: string;
  nome_completo: string;
  email: string;
  vinculo: "Discente" | "Docente" | "Colaborador";
  curso: "Medicina" | "Enfermagem" | "Nutrição" | "Fisioterapia";
  semestre: number;
  genero: "Masculino" | "Feminino" | "Outro" | "Prefiro não dizer";
  celular: string;
  data_nascimento?: string;
  data_cadastro?: string;
  experiencia_previa: boolean;
  termo_tcle: boolean;
  status: string;
}

export default function StudentsEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student>({
    cpf: "",
    nome_completo: "",
    email: "",
    vinculo: "Discente",
    curso: "Medicina",
    semestre: 1,
    genero: "Prefiro não dizer",
    celular: "",
    data_nascimento: "",
    experiencia_previa: false,
    termo_tcle: false,
    status: "ativo",
  });
  
  const [loading, setLoading] = useState(true);

 
  const maskCPF_LGPD = (cpf: string) => {
    const clean = cpf.replace(/\D/g, "");
    return clean.length === 11 
      ? `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**` 
      : clean;
  };

  const formatCelular = (cel: string) => {
    const clean = cel.replace(/\D/g, "");
    if (clean.length <= 10) return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!id) return;
        const ref = doc(db, "usuarios", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setStudent(snap.data() as Student);
        } else {
          alert("Usuário não encontrado!");
          navigate("/admin/registers");
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;
    
    if (name === "celular") {
        finalValue = value.replace(/\D/g, "").slice(0, 11);
    }

    setStudent({
      ...student,
      [name]: finalValue,
    });
  };

  const handleSave = async () => {
    try {
      if (!id) return;
      const ref = doc(db, "usuarios", id);
      await updateDoc(ref, { ...student });
      alert("Perfil acadêmico atualizado!");
      navigate("/admin/registers");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar dados.");
    }
  };

  if (loading) return (
    <AppMainContainer title="Sincronizando...">
      <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A0000]"></div>
          <p className="text-[#4A0000] font-black uppercase tracking-widest text-[10px]">Aguarde...</p>
      </div>
    </AppMainContainer>
  );

  return (
    <AppMainContainer title="Gestão de Alunos">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        
        
        <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-[#4A0000]">
               <span className="text-2xl font-black">{student.nome_completo.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{student.nome_completo}</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">
                  Documento: <span className="text-gray-600 font-mono">{maskCPF_LGPD(student.cpf || id || "")}</span>
                </p>
                <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">
                  Ingresso: <span className="text-gray-600">{student.data_cadastro || "---"}</span>
                </p>
              </div>
            </div>
          </div>
          <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            student.status === 'ativo' 
            ? 'bg-red-50 text-[#4A0000] border-red-100' 
            : 'bg-gray-100 text-gray-400 border-gray-200'
          }`}>
            Status: {student.status}
          </div>
        </div>

      
        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-10 border-b pb-4">
             <div className="h-6 w-1 bg-[#4A0000] rounded-full" />
             <h3 className="text-xs font-black text-[#4A0000] uppercase tracking-[0.2em]">Informações de Perfil Acadêmico</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
              <input name="nome_completo" value={student.nome_completo} onChange={handleChange} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] text-gray-700 font-bold transition-all" />
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Email Institucional</label>
              <input name="email" value={student.email} onChange={handleChange} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] text-gray-700 font-medium transition-all" />
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Contato Telefônico</label>
              <input 
                name="celular" 
                value={formatCelular(student.celular)} 
                onChange={handleChange} 
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] text-gray-700 font-bold transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-1">
               <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nascimento</label>
                  <input name="data_nascimento" value={student.data_nascimento} onChange={handleChange} placeholder="DD/MM/AAAA" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] text-gray-700 text-center transition-all" />
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Gênero</label>
                  <select name="genero" value={student.genero} onChange={handleChange} className="w-full border border-gray-200 p-4 rounded-xl outline-none bg-[#fbfbfb] focus:ring-2 focus:ring-red-50 text-gray-700 font-bold appearance-none">
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                    <option>Prefiro não dizer</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-1">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Vínculo</label>
                  <select name="vinculo" value={student.vinculo} onChange={handleChange} className="w-full border border-gray-200 p-4 rounded-xl outline-none bg-[#fbfbfb] focus:ring-2 focus:ring-red-50 text-gray-700 font-bold appearance-none">
                    <option>Discente</option>
                    <option>Docente</option>
                    <option>Colaborador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Semestre</label>
                  <input type="number" name="semestre" value={student.semestre} onChange={handleChange} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-50 bg-[#fbfbfb] text-gray-700 transition-all text-center font-black" />
                </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Área Acadêmica / Curso</label>
              <select name="curso" value={student.curso} onChange={handleChange} className="w-full border border-gray-200 p-4 rounded-xl outline-none bg-[#fbfbfb] focus:ring-2 focus:ring-red-50 text-gray-700 font-black appearance-none">
                <option>Medicina</option>
                <option>Enfermagem</option>
                <option>Nutrição</option>
                <option>Fisioterapia</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#4A0000] uppercase tracking-widest mb-3 ml-1">Status da Conta</label>
              <select name="status" value={student.status} onChange={handleChange} className="w-full border border-[#4A0000]/20 p-4 rounded-xl outline-none bg-red-50/30 focus:ring-2 focus:ring-red-100 text-[#4A0000] font-black appearance-none uppercase tracking-widest text-xs">
                <option value="ativo">Conta Ativa</option>
                <option value="inativo">Conta Inativa</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-50 pt-10">
              <label className="flex items-center gap-4 p-5 border border-gray-100 rounded-2xl hover:bg-red-50/50 transition-all cursor-pointer shadow-sm bg-white">
                <input type="checkbox" name="experiencia_previa" checked={student.experiencia_previa} onChange={handleChange} className="w-5 h-5 accent-[#4A0000] rounded-lg" />
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Experiência Prévia em BLS / RCP</span>
              </label>
              
              <label className="flex items-center gap-4 p-5 border border-gray-100 rounded-2xl hover:bg-red-50/50 transition-all cursor-pointer shadow-sm bg-white">
                <input type="checkbox" name="termo_tcle" checked={student.termo_tcle} onChange={handleChange} className="w-5 h-5 accent-[#4A0000] rounded-lg" />
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Termo TCLE Assinado</span>
              </label>
            </div>

          </div>
        </div>

        
        <div className="flex items-center justify-end gap-4 px-2 mb-20">
          <div className="w-44">
            <AppButton 
              name="Descartar" 
              form="round" 
              type="outline" 
              onClick={() => navigate("/admin/registers")} 
            />
          </div>
          <div className="w-64">
            <AppButton 
              name="Salvar Alterações" 
              form="round" 
              type="solid" 
              onClick={handleSave} 
            />
          </div>
        </div>

      </div>
    </AppMainContainer>
  );
}