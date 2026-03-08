
interface ImageProps {
    imageUrl: string;
}

export default function Image({imageUrl}: ImageProps) {
  const VITE_imageUrl = import.meta.env.VITE_BACKEND_URL + imageUrl;
  return (
    <div className="flex justify-center items-center h-120 w-120">
        { imageUrl ? (
            <img
                src={VITE_imageUrl} 
                alt='Local da Rodada' 
                className="max-w-full h-auto rounded-lg shadow-md" 
            />
        ) : (<p>Aguardando inicio da rodada...</p>) }
    </div>
  )
}

// Backend hosteia a imagem num link de fácil acesso temporariamente.