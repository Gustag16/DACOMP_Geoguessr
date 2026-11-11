import type { ReactNode } from "react";
interface PlayerCardProps {
    name: string;
    children: ReactNode; // aceita qualquer elemento React como filho
    isReady: boolean;
}

export default function PlayerCard({ name, children, isReady }: PlayerCardProps) {
    return (
        <div
        className={`relative w-72 h-24 m-3 outline outline-[10px] flex items-center justify-start px-4 gap-6 ${
            isReady
            ? 'outline-green-500 shadow-[0_0_15px_#fff,0_0_30px_rgba(74,222,128,1)]'
            : 'outline-white shadow-[0px_4px_4px_0px_rgba(184,184,184,0.25)]'
        }`}
        >
            {/* renderiza o que for passado dentro da tag */}
            {children} 
            <span className="text-white text-2xl font-normal font-['Audiowide']">{name}</span>
        </div>
    )
}