interface GuessButtonProps {
  onGuess: () => void;
  disabled: boolean;
}

export default function GuessButton({onGuess, disabled}: GuessButtonProps) {
  return (
    <div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded 
          disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onGuess}
          disabled={disabled}
        >
          Confirm Guess
        </button>
    </div>
  )
}