interface ScoreProps {
    score: number
}

export default function Score({score}: ScoreProps) {

    return (
        <div className="flex items-center gap-2 bg-gray-800 
        border-2 border-gray-600 px-6 py-2 rounded-xl shadow-lg 
        text-xl font-bold font-mono text-white">
            <span>Score:</span>
            <span className="text-green-400">{score}</span>
        </div>
  )
}