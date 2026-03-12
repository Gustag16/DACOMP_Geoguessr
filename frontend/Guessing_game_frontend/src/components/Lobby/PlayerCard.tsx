import type { ReactNode } from "react";
interface PlayerCardProps {
    name: string;
    children: ReactNode; // aceita qualquer elemento React como filho
}

export default function PlayerCard({ name, children }: PlayerCardProps) {
    return (
        <div className="w-72 h-24 m-3 shadow-[0px_4px_4px_0px_rgba(184,184,184,0.25)] outline outline-[10px] 
        outline-white flex items-center justify-start px-4 gap-6">
            {/* renderiza o que for passado dentro da tag */}
            {children} 
            <span className="text-white text-2xl font-normal font-['Audiowide']">{name}</span>
        </div>
    )
}