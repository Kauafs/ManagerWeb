import SignupForm from "../sign/LoginPage";

export default function Mode() {
  return (
    <div className="flex h-screen overflow-hidden">
     
      <div className="flex-1 justify-center items-center bg-[#4A0000] hidden lg:flex">
        <img src="public/img/logoof.png" alt="logo" width={580} height={600} />
      </div>

      <div className="flex flex-1 flex-col bg-(--background-primary)">
        
        <div className="flex-1 flex justify-center items-center">
          <SignupForm />
        </div>

        <footer className="pb-8 pt-4 text-center">
          <p className="text-[10px] md:text-xs text-gray-400 font-medium tracking-wide">
            © 2026 <span className="font-bold text-[#4A0000]">SAVEU</span>. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}