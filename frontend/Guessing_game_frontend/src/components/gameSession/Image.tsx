
interface ImageProps {
    imageUrl: string;
}
const dev = import.meta.env.DEV
const baseUrl = window.location.origin;


export default function Image({imageUrl}: ImageProps) {
    const VITE_imageUrl = dev 
        ? (import.meta.env.VITE_BACKEND_URL + imageUrl) 
        : `${baseUrl}${imageUrl}`;
  return (
    <div className="flex justify-center items-center">
        { imageUrl ? (
            <img
                src={VITE_imageUrl} 
                alt='Local da Rodada' 
                className="max-h-[60vh] max-w-[80vw] w-auto h-auto rounded-xl shadow-2xl object-contain"
            />
        ) : (
            <span className="bg-gray-800 text-white p-4 rounded-xl shadow-md">
                Aguardando inicio da rodada...
            </span>
        ) }
    </div>
  )
}

// Backend hosteia a imagem num link de fácil acesso temporariamente.