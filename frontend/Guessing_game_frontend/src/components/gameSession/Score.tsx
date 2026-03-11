interface ScoreProps {
    score: number
}

export default function Score({score}: ScoreProps) {

    return (
        <div className="flex items-center gap-2 bg-purple-800/65 
        border-2 border-purple-800 px-6 py-2 rounded-xl shadow-lg 
        text-xl text-white text-2xl font-normal font-['Audiowide']">
            <span>Score:</span>
            <span className="text-green-400">{score}</span>
        </div>
  )
}