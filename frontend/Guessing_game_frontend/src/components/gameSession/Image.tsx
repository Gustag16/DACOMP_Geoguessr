
interface ImageProps {
    imageUrl: string;
}

export default function Image({imageUrl}: ImageProps) {
  return (
    <div className="flex justify-center items-center">
        { imageUrl ? (
            <img
                src={imageUrl} 
                alt='Local da Rodada' 
                className="max-w-full h-auto rounded-lg shadow-md" 
            />
        ) : (<p>Aguardando inicio da rodada...</p>) }
    </div>
  )
}

// Backend hosteia a imagem num link de fácil acesso temporariamente.