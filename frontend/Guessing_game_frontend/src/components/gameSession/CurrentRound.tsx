
interface CurrentRoundProps {
    currentRoundNumber: number;
}

export default function CurrentRound({currentRoundNumber}: CurrentRoundProps) {
    return (
        <div className="flex items-center gap-2 bg-purple-800/65 
        border-2 border-purple-800 px-6 py-2 rounded-xl shadow-lg 
        text-xl text-white text-2xl font-normal font-['Audiowide']">
            Current round: {currentRoundNumber}
        </div>
    )
}