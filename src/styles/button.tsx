import React from "react";

export interface AppButtonProps {
  name: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
  form?: "square" | "round";
  type?: "solid" | "outline";
  disabled?: boolean
  className?: string;
  style?: React.CSSProperties;
}

export default function AppButton({
  name,
  onClick,
  color = "#4A0000", 
  textColor = "white",
  form = "square",
  type = "solid",
  disabled,
  className = "",
  style = {},
}: AppButtonProps) {
  
  const resolveVar = (value?: string) =>
    value?.startsWith("--") ? `var(${value})` : value;


  let tailwind = `${className} flex justify-center py-[5px] px-[15px] text-[15px] border transition-all active:scale-95`;

 
  tailwind += form === "round" ? " rounded-full" : " rounded-md";
  tailwind += disabled ? " opacity-50" : " cursor-pointer hover:brightness-110";


  const dynamicStyle: React.CSSProperties = {
    ...style,
    background: type === "solid" ? resolveVar(color) : "transparent",
    borderColor: resolveVar(color),
    color: type === "solid" ? resolveVar(textColor) : resolveVar(color),
    fontWeight: "bold", 
  };

  return (
    <div
      className={tailwind}
      style={dynamicStyle}
      onClick={disabled ? () => {} : onClick}
    >
      <p className="ff-default">{name}</p>
    </div>
  );
}