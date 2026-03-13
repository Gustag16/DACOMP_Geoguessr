import React from 'react';

// Listas ainda mais expandidas!
export const facesList = ['feliz', 'triste', 'medo', 'bravo', 'piscando', 'surpreso', 'neutro', 'xd', 'apaixonado', 'chorando'];
export const headsList = ['redonda', 'quadrada', 'triangular', 'losango', 'pentagono', 'elipse', 'hexagono', 'estrela', 'gota'];
export const accsList = ['chapeu', 'oculos', 'barba', 'nenhum', 'coroa', 'tapa_olho', 'faixa', 'fone', 'oculos_sol', 'aureola', 'laco'];
export const colorsList = ['vermelho', 'verde', 'azul', 'amarelo', 'roxo', 'rosa', 'laranja', 'ciano', 'marrom', 'preto', 'branco'];

export interface PlayerAvatarProps {
  head: string;
  face: string;
  acc: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

// Dicionário de cores (agora com 11 opções)
const colorMap: Record<string, string> = {
  vermelho: '#ef4444',
  verde: '#22c55e',
  azul: '#3b82f6',
  amarelo: '#eab308',
  roxo: '#a855f7',
  rosa: '#ec4899',
  laranja: '#f97316',
  ciano: '#06b6d4',
  marrom: '#92400e',
  preto: '#3f3f46',
  branco: '#f4f4f5',
};

// Dicionário de formatos de cabeça (agora com 9 opções)
const headShapes: Record<string, React.ReactNode> = {
  redonda: <circle cx="50" cy="50" r="40" />,
  quadrada: <rect x="10" y="10" width="80" height="80" rx="10" />,
  triangular: <polygon points="50,10 90,90 10,90" strokeLinejoin="round" strokeWidth="5" />,
  losango: <polygon points="50,10 90,50 50,90 10,50" strokeLinejoin="round" strokeWidth="5" />,
  pentagono: <polygon points="50,12 88,40 73,88 27,88 12,40" strokeLinejoin="round" strokeWidth="5" />,
  elipse: <ellipse cx="50" cy="50" rx="45" ry="35" />,
  hexagono: <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" strokeLinejoin="round" strokeWidth="5" />,
  estrela: <polygon points="50,10 61,35 88,35 66,54 74,80 50,65 26,80 34,54 12,35 39,35" strokeLinejoin="round" strokeWidth="3" />,
  gota: <path d="M 50 10 Q 80 50 80 70 A 30 30 0 0 1 20 70 Q 20 50 50 10 Z" strokeLinejoin="round" strokeWidth="3" />
};

// Dicionário de rostos (agora com 10 opções)
const faceShapes: Record<string, React.ReactNode> = {
  feliz: (
    <>
      <circle cx="35" cy="40" r="5" fill="#1f2937" />
      <circle cx="65" cy="40" r="5" fill="#1f2937" />
      <path d="M 35 60 Q 50 75 65 60" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  triste: (
    <>
      <circle cx="35" cy="45" r="5" fill="#1f2937" />
      <circle cx="65" cy="45" r="5" fill="#1f2937" />
      <path d="M 35 70 Q 50 55 65 70" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  medo: (
    <>
      <circle cx="35" cy="40" r="6" fill="#1f2937" />
      <circle cx="65" cy="40" r="6" fill="#1f2937" />
      <ellipse cx="50" cy="65" rx="8" ry="12" fill="#1f2937" />
    </>
  ),
  bravo: (
    <>
      <path d="M 25 35 L 42 42 M 75 35 L 58 42" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
      <circle cx="35" cy="45" r="4" fill="#1f2937" />
      <circle cx="65" cy="45" r="4" fill="#1f2937" />
      <path d="M 40 70 Q 50 65 60 70" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  piscando: (
    <>
      <path d="M 28 40 Q 35 35 42 40" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
      <circle cx="65" cy="40" r="5" fill="#1f2937" />
      <path d="M 35 60 Q 50 75 65 60" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  surpreso: (
    <>
      <circle cx="35" cy="40" r="5" fill="transparent" stroke="#1f2937" strokeWidth="3" />
      <circle cx="35" cy="40" r="2" fill="#1f2937" />
      <circle cx="65" cy="40" r="5" fill="transparent" stroke="#1f2937" strokeWidth="3" />
      <circle cx="65" cy="40" r="2" fill="#1f2937" />
      <circle cx="50" cy="65" r="7" fill="transparent" stroke="#1f2937" strokeWidth="4" />
    </>
  ),
  neutro: (
    <>
      <circle cx="35" cy="40" r="4" fill="#1f2937" />
      <circle cx="65" cy="40" r="4" fill="#1f2937" />
      <line x1="38" y1="65" x2="62" y2="65" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  xd: (
    <>
      {/* Olhos em formato de > < */}
      <path d="M 26 35 L 38 40 L 26 45 M 74 35 L 62 40 L 74 45" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="transparent" />
      {/* Boca aberta feliz */}
      <path d="M 35 55 Q 50 80 65 55 Z" fill="#1f2937" />
    </>
  ),
  apaixonado: (
    <>
      {/* Olhos de coração */}
      <path d="M 35 45 L 28 35 A 4.5 4.5 0 0 1 35 31 A 4.5 4.5 0 0 1 42 35 Z" fill="#ef4444" />
      <path d="M 65 45 L 58 35 A 4.5 4.5 0 0 1 65 31 A 4.5 4.5 0 0 1 72 35 Z" fill="#ef4444" />
      <path d="M 40 65 Q 50 75 60 65" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  chorando: (
    <>
      {/* Olhos fechados para baixo */}
      <path d="M 28 38 Q 35 33 42 38 M 58 38 Q 65 33 72 38" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
      {/* Lágrimas animadas com dash */}
      <line x1="35" y1="45" x2="35" y2="60" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 4" />
      <line x1="65" y1="45" x2="65" y2="60" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 4" />
      {/* Boca triste */}
      <path d="M 40 70 Q 50 60 60 70" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  )
};

// Dicionário de acessórios (agora com 11 opções)
const accShapes: Record<string, React.ReactNode> = {
  chapeu: <path d="M 10 20 L 90 20 L 70 5 L 30 5 Z" fill="#374151" />,
  oculos: (
    <>
      <rect x="25" y="35" width="20" height="12" fill="transparent" stroke="#374151" strokeWidth="3" rx="2" />
      <rect x="55" y="35" width="20" height="12" fill="transparent" stroke="#374151" strokeWidth="3" rx="2" />
      <line x1="45" y1="41" x2="55" y2="41" stroke="#374151" strokeWidth="3" />
    </>
  ),
  barba: <path d="M 30 65 Q 50 95 70 65 Q 50 75 30 65 Z" fill="#4b5563" />,
  coroa: (
    <path d="M 20 25 L 25 5 L 40 18 L 50 2 L 60 18 L 75 5 L 80 25 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" strokeLinejoin="round" />
  ),
  tapa_olho: (
    <>
      <path d="M 10 25 L 90 50" stroke="#1f2937" strokeWidth="3" />
      <circle cx="35" cy="40" r="12" fill="#1f2937" />
    </>
  ),
  faixa: (
    <path d="M 5 25 Q 50 35 95 25 L 95 35 Q 50 45 5 35 Z" fill="#dc2626" />
  ),
  fone: (
    <>
      {/* Arco do fone */}
      <path d="M 15 50 A 35 35 0 0 1 85 50" fill="transparent" stroke="#1f2937" strokeWidth="5" />
      {/* Almofadas do fone */}
      <rect x="10" y="40" width="12" height="24" rx="4" fill="#374151" />
      <rect x="78" y="40" width="12" height="24" rx="4" fill="#374151" />
    </>
  ),
  oculos_sol: (
    <>
      {/* Hastes */}
      <line x1="10" y1="38" x2="25" y2="38" stroke="#111827" strokeWidth="4" />
      <line x1="75" y1="38" x2="90" y2="38" stroke="#111827" strokeWidth="4" />
      {/* Lentes escuras */}
      <rect x="22" y="33" width="24" height="14" rx="3" fill="#111827" />
      <rect x="54" y="33" width="24" height="14" rx="3" fill="#111827" />
      {/* Ponte */}
      <line x1="46" y1="36" x2="54" y2="36" stroke="#111827" strokeWidth="3" />
    </>
  ),
  aureola: (
    <>
      <ellipse cx="50" cy="15" rx="20" ry="6" fill="transparent" stroke="#fef08a" strokeWidth="4" />
      <line x1="50" y1="21" x2="50" y2="28" stroke="#fef08a" strokeWidth="2" strokeDasharray="2 2" />
    </>
  ),
  laco: (
    <>
      <path d="M 50 15 L 30 5 L 30 25 Z M 50 15 L 70 5 L 70 25 Z" fill="#ec4899" />
      <circle cx="50" cy="15" r="5" fill="#be185d" />
    </>
  ),
  nenhum: null
};

const sizeClasses = {
  sm: 'w-16 h-16 rounded-[12px]',
  md: 'w-[100px] h-[100px] rounded-[20px]',
  lg: 'w-32 h-32 rounded-[24px]'
};

export default function PlayerAvatar({ head, face, acc, color, size = 'md' }: PlayerAvatarProps) {
  const fillColor = colorMap[color] || '#9ca3af'; 
  const selectedSize = sizeClasses[size];

  return (
    <div className={`${selectedSize} bg-zinc-300 flex items-center justify-center overflow-hidden`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g key="head" fill={fillColor}>
          {headShapes[head]}
        </g>
        <g key="face">
          {faceShapes[face]}
        </g>
        <g key="acc">
          {accShapes[acc]}
        </g>
      </svg>
    </div>
  );
}