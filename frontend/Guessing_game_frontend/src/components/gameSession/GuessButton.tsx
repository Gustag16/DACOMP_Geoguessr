interface GuessButtonProps {
  onGuess: () => void;
  disabled: boolean;
}

export default function GuessButton({onGuess, disabled}: GuessButtonProps) {
  return (
    <div>
        <button
          className="bg-purple-800/85 hover:bg-purple-700 text-white text-2xl font-normal font-['Audiowide'] py-2 px-6 
          border-2 border-purple-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onGuess}
          disabled={disabled}
        >
          Confirm Guess
        </button>
    </div>
  )
}