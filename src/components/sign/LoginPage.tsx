import { Formik } from "formik";
import * as Yup from "yup";
import AppButton from "../../styles/button";
import { IoMail, IoLockClosed, IoAlertCircleOutline } from "react-icons/io5";
import AppInput from "../../styles/input";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, signInWithEmailAndPassword, getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence} from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { useState } from "react";
import AppReset from "../utils/reset";
import { Remember } from "../utils/remember";
import emailjs from '@emailjs/browser';

type FormValues = {
  email: string;
  password: string;
};

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Formato de email inválido")
    .required("Email é obrigatório"),
  password: Yup.string()
    .min(6, "Senha deve ter pelo menos 8 caracteres")
    .required("Senha é obrigatória"),
});

export default function SignupForm() {
  const [ showReset, setShowReset ] = useState(false);
  const [ showContact, setShowContact ] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") === "true";
  });

  const initialValues: FormValues = { 
    email: localStorage.getItem("savedEmail") || "", 
    password: localStorage.getItem("savedPassword") || "" 
  };

  const navigate = useNavigate();

  const handleSubmit = async (values: FormValues) => {
    const authInstance = getAuth();
    try {
      await setPersistence(authInstance, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(authInstance, values.email, values.password);

      localStorage.setItem("rememberMe", rememberMe.toString());
      if (rememberMe) {
        localStorage.setItem("savedEmail", values.email);
        localStorage.setItem("savedPassword", values.password);
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("rememberMe");
      }
      navigate("admin/dashboard");
    } catch (error: any) {
      alert("Erro no login: " + error.message);
    }
  };

  return (
    <div className="w-[336px] flex flex-col">
      <h1 className="ff-default text-[37px] text-center mb-8 text-[#4A0000] font-black uppercase tracking-tighter">Entrar</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
      >
        {({errors, handleSubmit, isSubmitting, isValid}) => (
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            <div className="flex flex-col gap-2">
              <AppInput 
                label="E-mail de Acesso"
                name="email"
                type="email"
                placeholder="EMAIL"
                icon={<IoMail className="text-[#4A0000]" />}
                error={errors.email}
              />
              <AppInput 
                label="Senha"
                name="password"
                type="password"
                placeholder="SENHA"
                icon={<IoLockClosed className="text-[#4A0000]" />}
                error={errors.password}
              />
            </div>

            <div className="w-full mt-[-12px] mb-6">
              <Remember 
                rememberMe={rememberMe}
                onRememberChange={setRememberMe}
                onResetClick={() => setShowReset(true)}
                resetIcon={<IoAlertCircleOutline className="text-[#4A0000]"/>}
              />
            </div>

            <AppButton 
              name={isSubmitting ? "Autenticando..." : "Entrar"}  
              form="round"
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
            />
          </form>
        )}
      </Formik>

     
      {showReset && (
        <AppReset title="Esqueci a senha" onClose={() => setShowReset(false)}>
          <Formik
            initialValues={{ resetEmail: "" }}
            validationSchema={Yup.object().shape({
              resetEmail: Yup.string().email("Formato de email inválido").required("Email é obrigatório"),
            })}
            onSubmit={(values, { setSubmitting }) => {
              sendPasswordResetEmail(auth, values.resetEmail)
                .then(() => {
                  alert("Email de recuperação enviado!");
                  setShowReset(false);
                })
                .catch(err => alert("Erro: " + err.message))
                .finally(() => setSubmitting(false));
            }}
          >
            {({ errors, handleSubmit, isSubmitting, isValid }) => (
              <form onSubmit={handleSubmit}>
                <div className="flex-col flex items-stretch">
                  <img className="self-center my-10" src="src/assets/reset-password.png" alt="reset" width={120} height={120} />
                  <p className="text-center ff-default text-[16px] mb-4">Digite seu E-mail para redefinir sua senha.</p>
                  <AppInput name="resetEmail" type="email" placeholder="Digite seu email" icon={<IoMail className="text-[#4A0000]"/>} error={errors.resetEmail} />
                  <div className="flex justify-between mt-5 gap-4">
                    <button type="button" className="bg-white border border-[#4A0000] text-[#4A0000] rounded-full flex-1 py-2 font-bold" onClick={() => setShowReset(false)}>Cancelar</button>
                    <button type="submit" disabled={!isValid || isSubmitting} className="bg-[#4A0000] text-white rounded-full flex-1 py-2 font-bold">Enviar</button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </AppReset>
      )}

    
      {showContact && (
        <AppReset title="Solicitar Acesso" onClose={() => setShowContact(false)}>
          <Formik
            initialValues={{ contactEmail: "" }}
            validationSchema={Yup.object().shape({
              contactEmail: Yup.string().email("Formato inválido").required("Email é obrigatório"),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                
                const SERVICE_ID = 'CADASTRE A SUA ;)';
                const TEMPLATE_ID = 'CADASTRE A SUA ;)'; 
                const PUBLIC_KEY = 'CADASTRE A SUA ;)';

                const templateParams = {
                  name: "SOLICITAÇÃO DE CONTA",
                  to_email: "CADASTRE A SUA ;)", 
                  message: `NOVO INTERESSADO: O e-mail ${values.contactEmail} solicitou acesso ao sistema SAVEU.`,
                  data_evento: new Date().toLocaleDateString('pt-BR'),
                  hora_evento: new Date().toLocaleTimeString('pt-BR'),
                  local_evento: "Página de Login"
                };

                await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

                alert("Sua solicitação foi enviada direto ao administrador!");
                setShowContact(false);
              } catch (error) {
                console.error("Erro ao enviar e-mail:", error);
                alert("Erro ao enviar. Tente novamente mais tarde.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="flex-col flex items-stretch">
                <img className="self-center my-10" src="src/assets/reset-password.png" alt="contato" width={120} height={120} />
                <p className="text-center ff-default text-[16px] mb-4">Insira seu e-mail para solicitar seu cadastro no sistema.</p>
                <AppInput name="contactEmail" type="email" placeholder="Digite seu email" icon={<IoMail className="text-[#4A0000]" />} error={errors.contactEmail} />
                <div className="flex justify-between mt-5 gap-4">
                  <button type="button" className="bg-white border border-[#4A0000] text-[#4A0000] rounded-full flex-1 py-2 font-bold" onClick={() => setShowContact(false)}>Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="bg-[#4A0000] text-white rounded-full flex-1 py-2 font-bold">
                    {isSubmitting ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </AppReset>
      )}

      <p className="ff-default text-center mt-8 text-sm">
        Não tem conta? <span className="text-[#4A0000] cursor-pointer font-bold hover:underline uppercase text-[11px] tracking-widest" onClick={() => setShowContact(true)}>Solicitar acesso ao desenvolvedor</span>
      </p>
    </div>
  );
}