interface TimerProps {
    initialSeconds: number;
    isActive: boolean;
}

export default function Timer({initialSeconds, isActive}: TimerProps) {

    return (
        <div className="flex items-center gap-2 bg-purple-800/65 
        border-2 border-purple-800 px-6 py-2 rounded-xl shadow-lg 
        text-xl text-white text-2xl font-normal font-['Audiowide']">
            Tempo restante: <span className={initialSeconds <= 10 ? "text-red-500" : ""}>{ isActive ? initialSeconds : 0}</span>
        </div>
    );
}