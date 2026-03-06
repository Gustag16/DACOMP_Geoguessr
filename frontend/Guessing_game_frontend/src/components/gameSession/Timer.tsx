import { useState, useEffect } from 'react';

export default function Timer() {
    const [Seconds, setSeconds] = useState(30)

    useEffect(() => {
        if (Seconds <= 0){
            return;
        }
        const intervalId = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds - 1);
        }, 1000) 
        return () => clearInterval(intervalId);

    }, [Seconds])

    return (
        <div>
            Tempo restante: {Seconds} segundos
        </div>
  )
}