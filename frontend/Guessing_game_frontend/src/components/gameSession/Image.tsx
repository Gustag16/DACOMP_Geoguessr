
interface ImageProps {
    imageUrl: string;
}

export default function Image({imageUrl}: ImageProps) {
  const VITE_imageUrl = import.meta.env.VITE_BACKEND_URL + imageUrl;
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