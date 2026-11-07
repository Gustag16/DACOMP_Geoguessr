interface ImageProps {
    imageUrl: string;
    onLoad?: () => void;
}
const dev = import.meta.env.DEV;
const baseUrl = window.location.origin;

export function resolveMediaUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return dev ? `${import.meta.env.VITE_BACKEND_URL}${url}` : `${baseUrl}${url}`;
}

export default function Image({ imageUrl, onLoad }: ImageProps) {
    const resolvedUrl = resolveMediaUrl(imageUrl);

    return (
        <div className="flex justify-center items-center">
            {imageUrl ? (
                <img
                    src={resolvedUrl}
                    alt="Local da Rodada"
                    onLoad={onLoad}
                    className="max-h-[60vh] max-w-[80vw] w-auto h-auto rounded-xl shadow-2xl object-contain"
                />
            ) : (
                <span className="bg-gray-800 text-white p-4 rounded-xl shadow-md">
                    Aguardando inicio da rodada...
                </span>
            )}
        </div>
    );
}