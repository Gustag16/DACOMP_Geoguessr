import React from 'react';

export const facesList = ['feliz', 'triste', 'medo'];
export const headsList = ['redonda', 'quadrada', 'triangular'];
export const accsList = ['chapeu', 'oculos', 'barba', 'nenhum'];
export const colorsList = ['vermelho', 'verde', 'azul'];

// Interface baseada nas variáveis de customização do Lobby.tsx
export interface PlayerAvatarProps {
  head: string;
  face: string;
  acc: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

// Dicionário de cores
const colorMap: Record<string, string> = {
  vermelho: '#ef4444',
  verde: '#22c55e',
  azul: '#3b82f6',
};

// Dicionário de formatos de cabeça
const headShapes: Record<string, React.ReactNode> = {
  redonda: <circle cx="50" cy="50" r="40" />,
  quadrada: <rect x="10" y="10" width="80" height="80" rx="10" />,
  triangular: <polygon points="50,10 90,90 10,90" strokeLinejoin="round" strokeWidth="5" />
};

// Dicionário de rostos
const faceShapes: Record<string, React.ReactNode> = {
  feliz: (
    <>
      <circle cx="35" cy="40" r="5" fill="#1f2937" />
      <circle cx="65" cy="40" r="5" fill="#1f2937" />
      {/* Boca sorrindo */}
      <path d="M 35 60 Q 50 75 65 60" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  triste: (
    <>
      <circle cx="35" cy="45" r="5" fill="#1f2937" />
      <circle cx="65" cy="45" r="5" fill="#1f2937" />
      {/* Boca triste */}
      <path d="M 35 70 Q 50 55 65 70" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  medo: (
    <>
      <circle cx="35" cy="40" r="6" fill="#1f2937" />
      <circle cx="65" cy="40" r="6" fill="#1f2937" />
      {/* Boca aberta */}
      <ellipse cx="50" cy="65" rx="8" ry="12" fill="#1f2937" />
    </>
  )
};

// Dicionário de acessórios
const accShapes: Record<string, React.ReactNode> = {
  chapeu: <path d="M 10 20 L 90 20 L 70 5 L 30 5 Z" fill="#374151" />,
  oculos: (
    <>
      <rect x="25" y="35" width="20" height="12" fill="transparent" stroke="#374151" strokeWidth="3" rx="2" />
      <rect x="55" y="35" width="20" height="12" fill="transparent" stroke="#374151" strokeWidth="3" rx="2" />
      <line x1="45" y1="41" x2="55" y2="41" stroke="#374151" strokeWidth="3" />
    </>
  ),
  barba: <path d="M 35 65 Q 50 90 65 65 Z" fill="#4b5563" />,
  nenhum: null // caso o jogador não queira acessório
};

// Dicionário de tamanhos do Tailwind
const sizeClasses = {
  sm: 'w-16 h-16 rounded-[12px]',     // Pequeno (para o PlayerCard)
  md: 'w-[100px] h-[100px] rounded-[20px]', // Médio (o original, para o PlayerEdit)
  lg: 'w-32 h-32 rounded-[24px]'      // Grande (caso precise no futuro, como no pódio)
};

export default function PlayerAvatar({ head, face, acc, color, size = 'md' }: PlayerAvatarProps) {
  // pega a cor correspondente ou usa uma cor neutra como fallback
  const fillColor = colorMap[color] || '#9ca3af'; 
  
  // pega a classe de tamanho escolhida (se não passar nada, usa o 'md')
  const selectedSize = sizeClasses[size]

  return (
    <div className={`${selectedSize} bg-zinc-300 flex items-center justify-center overflow-hidden`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Camada 1: Forma da cabeça com a cor escolhida */}
        <g key="head" fill={fillColor}>
          {headShapes[head]}
        </g>
        {/* Camada 2: Expressão facial */}
        <g key="face">
          {faceShapes[face]}
        </g>
        {/* Camada 3: Acessório por cima de tudo */}
        <g key="acc">
          {accShapes[acc]}
        </g>
      </svg>
    </div>
  );
}