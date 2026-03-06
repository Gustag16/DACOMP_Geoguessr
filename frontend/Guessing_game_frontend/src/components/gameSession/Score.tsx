import { useState } from "react"

export default function Score() {
    const [Score, setScore] = useState(0);

    return (
        <div>
            Score: {Score}
        </div>
  )
}