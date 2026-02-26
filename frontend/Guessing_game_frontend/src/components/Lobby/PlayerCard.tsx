import React, { type ReactNode } from 'react'

interface PlayerCardProps {
    name: string;
    children: ReactNode; // aceita qualquer elemento React como filho
}

export default function PlayerCard({ name, children }: PlayerCardProps) {
    return (
        <div>
            {/* renderiza o que for passado dentro da tag */}
            {children} 
            <span className='font-bold'>{name}</span>
        </div>
    )
}