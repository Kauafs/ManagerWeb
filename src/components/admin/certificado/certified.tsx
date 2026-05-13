import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AppButton from '../../../styles/button';
import { storage, db } from '../../../../firebaseConfig'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

interface CertificadoProps {
  nomeAluno: string;
  cpfAluno: string;
  dataEmissao: string;
  codigoAutenticidade: string;
}

const GeradorCertificado: React.FC<CertificadoProps> = ({ nomeAluno, cpfAluno, dataEmissao, codigoAutenticidade }) => {
  const certificadoRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const sincronizarEFinalizar = async () => {
    const elemento = certificadoRef.current;
    if (!elemento) return;

    const confirmar = window.confirm(`Confirmar sincronização do certificado de ${nomeAluno}?`);
    if (!confirmar) return;

    setLoading(true);
    try {

      const canvas = await html2canvas(elemento, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false 
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const pdfBlob = pdf.output('blob');
      

      const storageRef = ref(storage, `certificados_oficiais/${cpfAluno}.pdf`);
      await uploadBytes(storageRef, pdfBlob);
      const downloadURL = await getDownloadURL(storageRef);


      const certRef = doc(db, "certificados", cpfAluno);
      await setDoc(certRef, {
        nome_aluno: nomeAluno,
        cpf_aluno: cpfAluno,
        data_emissao: Timestamp.now(),
        codigo_autenticidade: codigoAutenticidade,
        curso: "Suporte Básico de Vida",
        status: "Sincronizado com Mobile",
        url_pdf: downloadURL
      });


      const simulacaoRef = doc(db, "resultados_simulacao", cpfAluno); 
      await updateDoc(simulacaoRef, {
        liberado: true,
        sincronizado: true,
        url_pdf_gerada: downloadURL
      }).catch(() => console.log("Atualizado via CPF."));

      alert("Certificado sincronizado com sucesso!");
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Falha técnica ao gerar PDF. Verifique se há cores oklch no CSS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-40">
        <AppButton 
          name={loading ? "Sincronizando..." : "Aprovar"} 
          form="round" 
          onClick={sincronizarEFinalizar} 
          disabled={loading}
        />
      </div>

  
      <div className="absolute -left-[9999px] top-0">
        <div 
          ref={certificadoRef} 
          className="p-10 bg-white flex items-center justify-center"
          style={{ width: '1120px', height: '792px', backgroundColor: '#FFFFFF' }}
        >

          <div className="w-full h-full p-1 flex items-center justify-center" style={{ border: '15px solid #4A0000' }}>
            
            <div className="w-full h-full flex flex-col items-center justify-between p-14 text-center relative overflow-hidden" style={{ border: '2px solid #4A0000' }}>
              

              <span className="absolute text-[180px] font-black z-0 opacity-5" style={{ color: '#4A0000' }}>
                SAVEU
              </span>

              <div className="z-10">
                <h3 className="text-lg font-bold uppercase" style={{ color: '#4A0000', letterSpacing: '8px' }}>Sistema Acadêmico</h3>
                <h1 className="text-7xl font-black m-0" style={{ color: '#4A0000' }}>CERTIFICADO</h1>
                <div className="w-20 h-1 mx-auto mt-5" style={{ backgroundColor: '#4A0000' }}></div>
              </div>

             
              <div className="z-10 px-10">
                <p className="text-2xl italic mb-4" style={{ color: '#6B7280' }}>Certificamos para os devidos fins que</p>
                <h2 className="text-5xl font-black uppercase border-b pb-3 inline-block min-w-[600px]" style={{ color: '#111827', borderColor: '#F3F4F6' }}>
                  {nomeAluno}
                </h2>
                <p className="text-xl max-w-3xl mx-auto mt-6 leading-relaxed" style={{ color: '#374151' }}>
                  concluiu com êxito a capacitação em <strong style={{ color: '#111827' }}>SUPORTE BÁSICO DE VIDA (BLS)</strong>.
                </p>
              </div>

            
              <div className="w-full flex justify-between items-end px-10 z-10 text-left">
                <div className="space-y-1">
                  <p className="text-sm font-bold" style={{ color: '#4B5563' }}>CPF: <span className="font-medium">{cpfAluno}</span></p>
                  <p className="text-sm font-bold" style={{ color: '#4B5563' }}>EMISSÃO: <span className="font-medium">{dataEmissao}</span></p>
                  <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: '#D1D5DB' }}>AUTENTICIDADE: {codigoAutenticidade}</p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-3xl" style={{ color: '#4A0000', fontFamily: 'serif', fontStyle: 'italic' }}>SAVEU Group</span>
                  <div className="w-64 h-px" style={{ backgroundColor: '#4A0000' }}></div>
                  <p className="text-[11px] font-black tracking-[2px] mt-2 uppercase" style={{ color: '#4A0000' }}>Coordenação Pedagógica</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeradorCertificado;

