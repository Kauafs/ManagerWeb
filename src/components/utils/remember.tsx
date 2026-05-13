import React from "react";

interface RememberProps {
  rememberMe: boolean;
  onRememberChange: (value: boolean) => void;
  onResetClick: () => void;
  resetIcon?: React.ReactNode;
}

export const Remember: React.FC<RememberProps> = ({ 
  rememberMe, 
  onRememberChange, 
  onResetClick, 
  resetIcon 
}) => {
  return (
    <div className="flex justify-between items-center mt-2 w-full select-none">
 
      <button
        type="button"
        className="cursor-pointer text-[11px] ff-default text-[#4A0000] font-black flex items-center gap-1 hover:opacity-70 transition-opacity uppercase tracking-tighter"
        onClick={onResetClick}
      >
        {resetIcon} 
        Esqueci minha senha
      </button>

     
      <label className="flex items-center gap-2 text-[11px] ff-default text-gray-500 cursor-pointer font-bold uppercase tracking-tighter">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => onRememberChange(e.target.checked)}
          className="cursor-pointer w-3.5 h-3.5 accent-[#4A0000] border-gray-300 rounded transition-all"
        />
        Lembrar de mim
      </label>
    </div>
  );
};