import React from 'react';

export const facesList = [
  'feliz',
  'triste',
  'medo',
  'bravo',
  'piscando',
  'surpreso',
  'neutro',
  'xd',
  'apaixonado',
  'chorando',
  'desconfiado',
  'maroto',
  'lingua',
  'sonolento',
  'gato',
  'zumbi',
];

export const headsList = [
  'redonda',
  'quadrada',
  'triangular',
  'losango',
  'pentagono',
  'elipse',
  'hexagono',
  'estrela',
  'gota',
  'octogono',
  'escudo',
  'coracao',
  'nuvem',
  'fantasma',
];

export const accsList = [
  'nenhum',
  'chapeu',
  'bone',
  'cartola',
  'oculos',
  'oculos_sol',
  'monoculo',
  'bigode',
  'barba',
  'cavanhaque',
  'coroa',
  'tapa_olho',
  'faixa',
  'fone',
  'aureola',
  'laco',
  'chifres',
  'antena',
  'bandaid',
];

export const colorsList = [
  'vermelho',
  'verde',
  'azul',
  'amarelo',
  'roxo',
  'rosa',
  'laranja',
  'ciano',
  'marrom',
  'preto',
  'branco',
  'dourado',
  'turquesa',
  'vinho',
  'menta',
  'lavanda',
];

export interface PlayerAvatarProps {
  head: string;
  face: string;
  acc: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

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
  dourado: '#f59e0b',
  turquesa: '#14b8a6',
  vinho: '#9f1239',
  menta: '#6ee7b7',
  lavanda: '#c084fc',
};

// Todas as cabeças garantem largura suficiente em y=42 (olhos) e y=65 (boca)
const headShapes: Record<string, React.ReactNode> = {
  redonda: <circle cx="50" cy="52" r="40" />,
  quadrada: <rect x="12" y="12" width="76" height="78" rx="14" />,
  triangular: (
    <path
      d="M 50 10 C 76 10 92 42 90 78 C 89 88 82 90 50 90 C 18 90 11 88 10 78 C 8 42 24 10 50 10 Z"
      strokeLinejoin="round"
    />
  ),
  losango: (
    <path
      d="M 50 8 C 72 20 92 36 92 52 C 92 68 72 82 50 92 C 28 82 8 68 8 52 C 8 36 28 20 50 8 Z"
      strokeLinejoin="round"
    />
  ),
  pentagono: (
    <polygon
      points="50,10 90,36 76,90 24,90 10,36"
      strokeLinejoin="round"
      strokeWidth="6"
      stroke="currentColor"
    />
  ),
  elipse: <ellipse cx="50" cy="52" rx="44" ry="36" />,
  hexagono: (
    <polygon
      points="50,10 88,28 88,74 50,92 12,74 12,28"
      strokeLinejoin="round"
      strokeWidth="4"
      stroke="currentColor"
    />
  ),
  estrela: (
    <polygon
      points="50,6 64,26 92,30 74,52 80,86 50,74 20,86 26,52 8,30 36,26"
      strokeLinejoin="round"
      strokeWidth="5"
      stroke="currentColor"
    />
  ),
  gota: (
    <path
      d="M 50 8 C 74 24 88 42 88 60 A 38 32 0 1 1 12 60 C 12 42 26 24 50 8 Z"
      strokeLinejoin="round"
    />
  ),
  octogono: (
    <polygon
      points="34,10 66,10 90,34 90,68 66,92 34,92 10,68 10,34"
      strokeLinejoin="round"
      strokeWidth="3"
      stroke="currentColor"
    />
  ),
  escudo: (
    <path
      d="M 14 16 L 86 16 L 86 50 C 86 74 68 86 50 94 C 32 86 14 74 14 50 Z"
      strokeLinejoin="round"
    />
  ),
  coracao: (
    <path
      d="M 50 24 C 35 6 8 14 8 42 C 8 68 32 82 50 92 C 68 82 92 68 92 42 C 92 14 65 6 50 24 Z"
      strokeLinejoin="round"
    />
  ),
  nuvem: (
    <path
      d="M 26 86 C 14 86 8 76 12 64 C 6 52 12 36 24 34 C 26 18 42 12 54 18 C 68 12 84 20 84 36 C 94 42 94 60 86 68 C 88 80 78 86 68 86 Z"
      strokeLinejoin="round"
    />
  ),
  fantasma: (
    <path
      d="M 14 50 A 36 38 0 0 1 86 50 L 86 90 L 74 82 L 62 90 L 50 82 L 38 90 L 26 82 L 14 90 Z"
      strokeLinejoin="round"
    />
  ),
};

// Todos os rostos têm olhos ancorados em (35, 42) e (65, 42) e boca em y=62..70
const faceShapes: Record<string, React.ReactNode> = {
  feliz: (
    <>
      <circle cx="35" cy="42" r="5" fill="#1f2937" />
      <circle cx="65" cy="42" r="5" fill="#1f2937" />
      <path d="M 35 62 Q 50 75 65 62" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  triste: (
    <>
      <path d="M 26 35 Q 34 32 42 37 M 74 35 Q 66 32 58 37" stroke="#1f2937" strokeWidth="3" fill="transparent" strokeLinecap="round" />
      <circle cx="35" cy="42" r="5" fill="#1f2937" />
      <circle cx="65" cy="42" r="5" fill="#1f2937" />
      <path d="M 36 70 Q 50 58 64 70" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  medo: (
    <>
      <path d="M 25 34 Q 35 30 43 35 M 75 34 Q 65 30 57 35" stroke="#1f2937" strokeWidth="3" fill="transparent" strokeLinecap="round" />
      <circle cx="35" cy="42" r="6.5" fill="#ffffff" stroke="#1f2937" strokeWidth="2.5" />
      <circle cx="35" cy="42" r="3" fill="#1f2937" />
      <circle cx="65" cy="42" r="6.5" fill="#ffffff" stroke="#1f2937" strokeWidth="2.5" />
      <circle cx="65" cy="42" r="3" fill="#1f2937" />
      <ellipse cx="50" cy="66" rx="7" ry="9" fill="#1f2937" />
    </>
  ),
  bravo: (
    <>
      <path d="M 25 33 L 43 39 M 75 33 L 57 39" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
      <circle cx="35" cy="42" r="4.5" fill="#1f2937" />
      <circle cx="65" cy="42" r="4.5" fill="#1f2937" />
      <path d="M 37 68 Q 50 60 63 68" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  piscando: (
    <>
      <path d="M 28 42 Q 35 35 42 42" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
      <circle cx="65" cy="42" r="5" fill="#1f2937" />
      <path d="M 35 62 Q 50 75 65 62" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  surpreso: (
    <>
      <circle cx="35" cy="42" r="6" fill="transparent" stroke="#1f2937" strokeWidth="3" />
      <circle cx="35" cy="42" r="2.5" fill="#1f2937" />
      <circle cx="65" cy="42" r="6" fill="transparent" stroke="#1f2937" strokeWidth="3" />
      <circle cx="65" cy="42" r="2.5" fill="#1f2937" />
      <circle cx="50" cy="66" r="6.5" fill="transparent" stroke="#1f2937" strokeWidth="4" />
    </>
  ),
  neutro: (
    <>
      <circle cx="35" cy="42" r="4.5" fill="#1f2937" />
      <circle cx="65" cy="42" r="4.5" fill="#1f2937" />
      <line x1="37" y1="65" x2="63" y2="65" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  xd: (
    <>
      <path d="M 27 37 L 41 42 L 27 47 M 73 37 L 59 42 L 73 47" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="transparent" />
      <path d="M 34 60 Q 50 78 66 60 Z" fill="#1f2937" />
      <path d="M 42 66 Q 50 73 58 66 Z" fill="#ef4444" />
    </>
  ),
  apaixonado: (
    <>
      <path d="M 35 48 L 27 39 A 4.8 4.8 0 0 1 35 34 A 4.8 4.8 0 0 1 43 39 Z" fill="#ef4444" />
      <path d="M 65 48 L 57 39 A 4.8 4.8 0 0 1 65 34 A 4.8 4.8 0 0 1 73 39 Z" fill="#ef4444" />
      <path d="M 37 62 Q 50 74 63 62" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  chorando: (
    <>
      <path d="M 28 42 Q 35 36 42 42 M 58 42 Q 65 36 72 42" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
      <path d="M 32 46 Q 32 58 35 60 Q 38 58 38 46 Z" fill="#38bdf8" />
      <path d="M 62 46 Q 62 58 65 60 Q 68 58 68 46 Z" fill="#38bdf8" />
      <path d="M 38 70 Q 50 60 62 70" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
    </>
  ),
  desconfiado: (
    <>
      <line x1="26" y1="36" x2="43" y2="36" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 57 35 Q 65 29 74 35" stroke="#1f2937" strokeWidth="3.5" fill="transparent" strokeLinecap="round" />
      <circle cx="37" cy="42" r="4.5" fill="#1f2937" />
      <circle cx="67" cy="42" r="4.5" fill="#1f2937" />
      <path d="M 38 66 L 60 63" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  maroto: (
    <>
      {/* Sobrancelhas grossas modeladas + linhas finas externas */}
      <path
        d="M 20 35 C 24 29 34 29 45 31 C 47 31.5 47 34.5 44 34.5 C 34 33 26 33 21 36 Z"
        fill="#1f2937"
      />
      <path
        d="M 80 35 C 76 29 66 29 55 31 C 53 31.5 53 34.5 56 34.5 C 66 33 74 33 79 36 Z"
        fill="#1f2937"
      />
      <path
        d="M 18.5 33 Q 22 29 26.5 28.2 M 81.5 33 Q 78 29 73.5 28.2"
        stroke="#1f2937"
        strokeWidth="1.4"
        fill="transparent"
        strokeLinecap="round"
      />

      {/* Dobras horizontais das pálpebras */}
      <line x1="28" y1="36.8" x2="42" y2="36.8" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="58" y1="36.8" x2="72" y2="36.8" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" />

      {/* Olho esquerdo (ancorado em 35, 42) */}
      <path d="M 24 44 L 29 39.5 L 42 39.5 L 43 44.5 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
      <rect x="30" y="39.5" width="7.8" height="5" rx="1.5" fill="#1f2937" />
      <path d="M 39.5 39.5 Q 41 42 40 44.5" stroke="#1f2937" strokeWidth="1.5" fill="transparent" />
      <circle cx="32.5" cy="41.8" r="1" fill="#ffffff" />
      <path d="M 44.8 39.2 Q 46.8 42 45.2 44.8" stroke="#1f2937" strokeWidth="2" fill="transparent" strokeLinecap="round" />

      {/* Olho direito (ancorado em 65, 42) */}
      <path d="M 76 44 L 71 39.5 L 58 39.5 L 57 44.5 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
      <rect x="62.2" y="39.5" width="7.8" height="5" rx="1.5" fill="#1f2937" />
      <path d="M 60.5 39.5 Q 59 42 60 44.5" stroke="#1f2937" strokeWidth="1.5" fill="transparent" />
      <circle cx="64.5" cy="41.8" r="1" fill="#ffffff" />
      <path d="M 55.2 39.2 Q 53.2 42 54.8 44.8" stroke="#1f2937" strokeWidth="2" fill="transparent" strokeLinecap="round" />

      {/* Sorriso de canto + marcação lateral do maxilar/bochecha */}
      <path d="M 32.5 64.8 L 34 69" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 33 66.8 C 44 67.5 59 67 66.5 59.5" stroke="#1f2937" strokeWidth="3" fill="transparent" strokeLinecap="round" />
      <path d="M 76 53.5 Q 72 63 69.5 74" stroke="#1f2937" strokeWidth="2.5" fill="transparent" strokeLinecap="round" />
    </>
  ),
  lingua: (
    <>
      <circle cx="35" cy="42" r="5" fill="#1f2937" />
      <path d="M 58 42 Q 65 35 72 42" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
      <path d="M 35 62 Q 50 70 65 62" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
      <path d="M 44 65 L 44 73 A 6 6 0 0 0 56 73 L 56 65 Z" fill="#fb7185" stroke="#1f2937" strokeWidth="2.5" />
      <line x1="50" y1="65" x2="50" y2="73" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  sonolento: (
    <>
      <path d="M 27 42 Q 35 48 43 42 M 57 42 Q 65 48 73 42" stroke="#1f2937" strokeWidth="4" fill="transparent" strokeLinecap="round" />
      <ellipse cx="50" cy="66" rx="5" ry="6" fill="#1f2937" />
      <circle cx="75" cy="34" r="5" fill="#bae6fd" fillOpacity="0.8" stroke="#0284c7" strokeWidth="2" />
    </>
  ),
  gato: (
    <>
      <circle cx="35" cy="42" r="5.5" fill="#1f2937" />
      <circle cx="33" cy="40" r="2" fill="#ffffff" />
      <circle cx="65" cy="42" r="5.5" fill="#1f2937" />
      <circle cx="63" cy="40" r="2" fill="#ffffff" />
      <polygon points="47,53 53,53 50,57" fill="#fb7185" />
      <path d="M 36 63 Q 43 70 50 62 Q 57 70 64 63" stroke="#1f2937" strokeWidth="3.5" fill="transparent" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  zumbi: (
    <>
      <path d="M 29 36 L 41 48 M 41 36 L 29 48" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
      <path d="M 59 36 L 71 48 M 71 36 L 59 48" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
      <line x1="34" y1="65" x2="66" y2="65" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="40" y1="61" x2="40" y2="69" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="61" x2="50" y2="69" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="61" x2="60" y2="69" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
};

// Acessórios alinhados com olhos em (35,42)/(65,42), topo em y=8..26 e boca em y=62..70
const accShapes: Record<string, React.ReactNode> = {
  nenhum: null,
  chapeu: (
    <>
      {/* Copa do chapéu estilo fedora */}
      <path
        d="M 24 24 C 24 10 34 6 42 8 C 47 9 53 9 58 8 C 66 6 76 10 76 24 Z"
        fill="#374151"
        stroke="#1f2937"
        strokeWidth="2.5"
      />
      {/* Fita vermelha da copa */}
      <path d="M 24 20 Q 50 23 76 20 L 76 24 Q 50 27 24 24 Z" fill="#dc2626" />
      {/* Aba curvada */}
      <path
        d="M 8 23 Q 50 29 92 23 Q 95 27 88 28 Q 50 33 12 28 Q 5 27 8 23 Z"
        fill="#1f2937"
      />
    </>
  ),
  bone: (
    <>
      {/* Domo do boné */}
      <path d="M 18 26 C 18 8 82 8 82 26 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2.5" />
      {/* Botão no topo */}
      <circle cx="50" cy="11" r="2.5" fill="#1e3a8a" />
      {/* Detalhe frontal */}
      <path d="M 38 25 C 38 14 62 14 62 25" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
      {/* Aba lateral/frontal */}
      <path d="M 16 24 Q 55 21 94 27 Q 96 32 82 32 Q 48 28 16 27 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2" />
    </>
  ),
  cartola: (
    <>
      {/* Copa alta */}
      <path d="M 28 24 L 26 4 L 74 4 L 72 24 Z" fill="#18181b" stroke="#09090b" strokeWidth="2.5" />
      {/* Faixa dourada */}
      <rect x="27.5" y="18" width="45" height="5" fill="#eab308" />
      {/* Aba da cartola */}
      <rect x="12" y="23" width="76" height="5" rx="2.5" fill="#27272a" stroke="#09090b" strokeWidth="2" />
    </>
  ),
  oculos: (
    <>
      {/* Hastes laterais */}
      <line x1="10" y1="39" x2="21" y2="41" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      <line x1="79" y1="41" x2="90" y2="39" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      {/* Lentes com reflexo sutil (centradas exatamente em y=42) */}
      <rect x="21" y="34" width="25" height="16" rx="4" fill="#ffffff" fillOpacity="0.2" stroke="#1f2937" strokeWidth="3.5" />
      <rect x="54" y="34" width="25" height="16" rx="4" fill="#ffffff" fillOpacity="0.2" stroke="#1f2937" strokeWidth="3.5" />
      {/* Ponte central */}
      <path d="M 46 41 Q 50 38 54 41" stroke="#1f2937" strokeWidth="3.5" fill="transparent" />
    </>
  ),
  oculos_sol: (
    <>
      {/* Hastes */}
      <line x1="10" y1="38" x2="20" y2="40" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="40" x2="90" y2="38" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />
      {/* Armação escura estilo Wayfarer centrada em y=42 */}
      <path d="M 19 34 L 47 34 L 45 49 Q 33 52 21 48 Z" fill="#111827" stroke="#09090b" strokeWidth="2" />
      <path d="M 53 34 L 81 34 L 79 48 Q 67 52 55 49 Z" fill="#111827" stroke="#09090b" strokeWidth="2" />
      {/* Ponte */}
      <line x1="45" y1="36" x2="55" y2="36" stroke="#09090b" strokeWidth="4" />
      {/* Brilho nas lentes */}
      <line x1="25" y1="38" x2="31" y2="45" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="59" y1="38" x2="65" y2="45" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
    </>
  ),
  monoculo: (
    <>
      {/* Corrente dourada */}
      <path d="M 77 46 Q 82 62 72 78" stroke="#eab308" strokeWidth="2" strokeDasharray="2 2" fill="transparent" />
      {/* Lente no olho direito (65, 42) */}
      <circle cx="65" cy="42" r="12" fill="#fef08a" fillOpacity="0.25" stroke="#ca8a04" strokeWidth="3.5" />
      <line x1="60" y1="36" x2="65" y2="41" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
    </>
  ),
  bigode: (
    <>
      {/* Bigode imperial curvado posicionado entre os olhos (y=42) e a boca (y=62) */}
      <path
        d="M 50 54 C 44 49 34 50 26 56 C 22 59 17 57 19 53 C 14 57 18 63 27 61 C 36 59 44 59 50 56 C 56 59 64 59 73 61 C 82 63 86 57 81 53 C 83 57 78 59 74 56 C 66 50 56 49 50 54 Z"
        fill="#3f2e21"
        stroke="#271c15"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </>
  ),
  barba: (
    <>
      {/* Barba cheia com costeletas, bigode integrado e abertura para a boca */}
      <path
        d="M 15 44 L 21 44 L 23 58 C 28 54 39 52 50 54 C 61 52 72 54 77 58 L 79 44 L 85 44 C 87 64 82 88 50 94 C 18 88 13 64 15 44 Z M 33 61 C 33 73 67 73 67 61 C 58 58 42 58 33 61 Z"
        fill="#3f2e21"
        fillRule="evenodd"
        stroke="#271c15"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  cavanhaque: (
    <>
      {/* Bigode + barbicha no queixo deixando a boca visível no centro */}
      <path
        d="M 50 53 C 42 50 33 53 30 59 C 38 57 45 57 50 56 C 55 57 62 57 70 59 C 67 53 58 50 50 53 Z"
        fill="#3f2e21"
        stroke="#271c15"
        strokeWidth="1.5"
      />
      <path
        d="M 36 74 Q 50 78 64 74 Q 62 91 50 93 Q 38 91 36 74 Z"
        fill="#3f2e21"
        stroke="#271c15"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </>
  ),
  coroa: (
    <>
      <path
        d="M 18 26 L 15 8 L 33 18 L 50 4 L 67 18 L 85 8 L 82 26 Z"
        fill="#facc15"
        stroke="#b45309"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="16" r="3" fill="#ef4444" />
      <circle cx="31" cy="21" r="2.5" fill="#3b82f6" />
      <circle cx="69" cy="21" r="2.5" fill="#22c55e" />
    </>
  ),
  tapa_olho: (
    <>
      <path d="M 12 28 L 88 48" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 24 33 L 46 35 L 45 48 C 39 53 29 52 24 46 Z" fill="#111827" stroke="#374151" strokeWidth="2" />
    </>
  ),
  faixa: (
    <>
      {/* Nós da bandana na lateral */}
      <path d="M 84 26 L 96 20 L 93 28 L 97 34 L 83 31 Z" fill="#b91c1c" />
      {/* Faixa principal na testa */}
      <path d="M 10 24 Q 50 31 90 24 L 90 33 Q 50 40 10 33 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
    </>
  ),
  fone: (
    <>
      {/* Arco acolchoado por cima da cabeça */}
      <path d="M 12 48 A 38 38 0 0 1 88 48" fill="transparent" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
      <path d="M 32 14 A 24 20 0 0 1 68 14" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
      {/* Conchas acústicas laterais */}
      <rect x="5" y="36" width="13" height="26" rx="6" fill="#ef4444" stroke="#1f2937" strokeWidth="2.5" />
      <rect x="82" y="36" width="13" height="26" rx="6" fill="#ef4444" stroke="#1f2937" strokeWidth="2.5" />
    </>
  ),
  aureola: (
    <>
      <ellipse cx="50" cy="11" rx="26" ry="6.5" fill="transparent" stroke="#facc15" strokeWidth="4.5" />
      <ellipse cx="50" cy="11" rx="26" ry="6.5" fill="transparent" stroke="#fef08a" strokeWidth="2" />
    </>
  ),
  laco: (
    <>
      <path
        d="M 50 18 L 28 6 C 24 12 24 22 28 28 Z M 50 18 L 72 6 C 76 12 76 22 72 28 Z"
        fill="#ec4899"
        stroke="#9d174d"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="18" r="5.5" fill="#f43f5e" stroke="#9d174d" strokeWidth="2.5" />
    </>
  ),
  chifres: (
    <>
      <path d="M 28 22 C 16 18 12 6 20 4 C 22 12 28 14 36 18 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 72 22 C 84 18 88 6 80 4 C 78 12 72 14 64 18 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  antena: (
    <>
      <path d="M 42 16 L 50 8 L 58 16 Z" fill="#6b7280" stroke="#374151" strokeWidth="2" />
      <line x1="50" y1="12" x2="50" y2="3" stroke="#374151" strokeWidth="3.5" />
      <circle cx="50" cy="4" r="4" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />
    </>
  ),
  bandaid: (
    <>
      <g transform="rotate(-18 64 26)">
        <rect x="50" y="21" width="28" height="10" rx="4" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
        <rect x="59" y="21" width="10" height="10" fill="#ffedd5" stroke="#c2410c" strokeWidth="1.5" />
        <circle cx="55" cy="26" r="1" fill="#c2410c" />
        <circle cx="73" cy="26" r="1" fill="#c2410c" />
      </g>
    </>
  ),
};

const sizeClasses = {
  sm: 'w-16 h-16 rounded-[12px]',
  md: 'w-[100px] h-[100px] rounded-[20px]',
  lg: 'w-32 h-32 rounded-[24px]',
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
        <g key="head" fill={fillColor} style={{ color: fillColor }}>
          {headShapes[head] || headShapes.redonda}
        </g>
        <g key="face">
          {faceShapes[face] || faceShapes.feliz}
        </g>
        <g key="acc">
          {accShapes[acc] ?? null}
        </g>
      </svg>
    </div>
  );
}