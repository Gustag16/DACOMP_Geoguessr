import { useState, useEffect } from 'react';

interface TimerProps {
    initialSeconds: number;
    isActive: boolean;
}

export default function Timer({initialSeconds, isActive}: TimerProps) {
    const [seconds, setSeconds] = useState(initialSeconds)

    useEffect(() => {
        if (!isActive){
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
        <div className="text-2xl font-bold font-mono">
            Tempo restante: <span className={seconds <= 5 ? "text-red-500" : ""}>{seconds}</span>
        </div>
    );
}