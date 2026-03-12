import { useState, useEffect } from 'react';

interface TimerProps {
    initialSeconds: number;
    isActive: boolean;
}

export default function Timer({initialSeconds, isActive}: TimerProps) {
    const [seconds, setSeconds] = useState(initialSeconds)

    useEffect(() => {
        if (!isActive){
            // se não estiver no tempo inicial, mostra 0
            setSeconds((prev) => prev < initialSeconds ? 0 : initialSeconds);
            return;
        }

        setSeconds(initialSeconds);

        const intervalId = setInterval(() => {
            setSeconds((prevSeconds) => {
                if (prevSeconds <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prevSeconds - 1;
            });
        }, 1000) 
        // limpeza de segurança
        return () => clearInterval(intervalId);

    }, [isActive, initialSeconds]);

    return (
        <div className="flex items-center gap-2 bg-purple-800/65 
        border-2 border-purple-800 px-6 py-2 rounded-xl shadow-lg 
        text-xl text-white text-2xl font-normal font-['Audiowide']">
            Tempo restante: <span className={seconds <= 10 ? "text-red-500" : ""}>{seconds}</span>
        </div>
    );
}