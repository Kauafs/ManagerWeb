import { Field } from "formik";
import React, { useState } from "react";
import { IoEyeOff, IoEye } from "react-icons/io5";

export interface AppInputProps {
    name?: string;
    type?: string;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    error?: any;
    style?: any;
    className?: string;
}

export default function AppInput({
    name,
    type = "text",
    label,
    placeholder,
    icon,
    error,
    style,
    className = ''
}: AppInputProps) {

    const [showPassword, setShowPassword] = useState(false);

    const inputType = type == "password" ? (showPassword ? "text" : "password") : type;

    return (
        <div className={className} style={style}>
            {label && <p className="ff-default ml-3 mb-[-10px] text-sm font-medium text-gray-600">{label}</p>}
            
          
            <div className="rounded-xl border-2 border-[#dedede] p-2 flex items-center bg-[#f5f5f5] my-2 
                            transition-all duration-200
                            focus-within:border-[#4A0000] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4A0000]">
                
                {icon && <span className="mx-2 text-gray-400">{icon}</span>}
                
                <Field 
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                />
                
                {type == "password" && (
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-gray-500 hover:text-[#4A0000] transition-colors"
                    >
                        {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                    </button>
                )}
            </div>
            
            {error && <p className="text-[tomato] ff-default text-[12px] text-right mt-[-10px] font-bold uppercase italic">{error}</p>}
        </div>
    );
}