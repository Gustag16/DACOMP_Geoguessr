
interface ImageProps {
    imageUrl: string;
}
const dev = import.meta.env.DEV
const baseUrl = window.location.origin;


export default function Image({imageUrl}: ImageProps) {
    // Garante que imageUrl comece com '/'
    const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;

    // Remove barra final da baseUrl e VITE_BACKEND_URL, se houver
    const backendBase = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');
    const frontendOrigin = window.location.origin.replace(/\/$/, '');

    const fullUrl = dev
        ? `${backendBase}${normalizedUrl}`
        : `${frontendOrigin}${normalizedUrl}`;

    return (
        <div className="flex justify-center items-center">
            { imageUrl ? (
                <img
                    src={fullUrl} 
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