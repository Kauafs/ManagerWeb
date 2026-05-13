import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";

export interface AppResetProps {
  children: ReactNode;
  title?: string;
  onClose?: () => void;
}

export default function AppReset({ children, title, onClose }: AppResetProps) {
  return (
    <div>
      
      <div 
        className="fixed top-0 left-0 bg-black opacity-40 h-full w-full" 
        onClick={onClose} 
      />

      <div className="fixed top-0 left-0 h-full w-full flex justify-center items-center">
        <div className="bg-white p-[50px] rounded-xl max-w-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <p className="ff-default text-[30px] font-bold">{title}</p>
            {onClose && <IoClose className="cursor-pointer text-[20px]" onClick={onClose} />}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}