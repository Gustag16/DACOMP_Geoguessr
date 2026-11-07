import { useEffect, useState } from "react";

interface TimerProps {
    roundStartedAt: number | null;
    timeLimit: number;
    serverOffset: number;
    isActive: boolean;
}

export default function Timer({ roundStartedAt, timeLimit, serverOffset, isActive }: TimerProps) {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(timeLimit);

    useEffect(() => {
        if (!isActive || !roundStartedAt) {
            setRemainingSeconds(0);
            return;
        }

        const updateTimer = () => {
            const serverNow = Date.now() + serverOffset;
            const endTime = roundStartedAt + timeLimit * 1000;
            const diffSeconds = Math.ceil((endTime - serverNow) / 1000);
            setRemainingSeconds(Math.max(0, diffSeconds));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 200);

        return () => clearInterval(interval);
    }, [roundStartedAt, timeLimit, serverOffset, isActive]);

    return (
        <div className="flex items-center gap-2 bg-purple-800/65 
        border-2 border-purple-800 px-6 py-2 rounded-xl shadow-lg 
        text-xl text-white text-2xl font-normal font-['Audiowide']">
            Tempo restante: <span className={remainingSeconds <= 10 ? "text-red-500" : ""}>{isActive ? remainingSeconds : 0}</span>
        </div>
    );
}