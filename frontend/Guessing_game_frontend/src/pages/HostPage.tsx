// Somente acessível pelo "admin". Precisa de uma senha e tals
// Aqui escolhe qual sessão vai ser iniciada, lim de players e lim de tempo
// Também decide quando vai a sessão vai sair do lobby, e começar a partida
import {fetchSessions, startSession, lobbySession, deactivateSession, startRoundManual} from "../api/Host/HostServices";
import type { Session } from "../utils/interfaces/sessionInterface";
import { useState, useEffect, type ChangeEvent } from "react";


export default function HostPage() {

    const [sessions, setSessions] = useState<Session[]>([])
    const [selectedSessionId, setSelectedSessionId] = useState<string>(""); 
    useEffect(() => {
        fetchSessions().then((sessions) => {
            setSessions(sessions);
            console.log(sessions); 
        });
    }, []);

    function handleStartSession(sessionCode: string) {
        startSession(sessionCode)
            .then(() => {
                alert("Game started!");
            })
            .catch((error) => {
                console.error("Error starting session:", error);
                alert("Failed to start the game. Please try again.");
            });
    }


    function handleLobbySession(sessionCode: string) {
        lobbySession(sessionCode)
            .then(() => {
                alert("Session set to lobby!");
            })
            .catch((error) => {
                console.error("Error setting session to lobby:", error);
                alert("Failed to set session to lobby. Please try again.");
            });
    }

    function handleDeactivateSession(sessionCode: string) {
        deactivateSession(sessionCode)
            .then(() => {
                alert("Session deactivated!");
            })
            .catch((error) => {
                console.error("Error deactivating session:", error);
                alert("Failed to deactivate session. Please try again.");
            });
    }

    function handleStartRoundsLogic(selectedSessionId: string) {
        startRoundManual(selectedSessionId)
    }

    


    return (
        <>
        <div className="flex flex-col justify-center items-center gap-4">
        <h2 className="font-bold">Host Page</h2>
        <div className ="flex flex-col items-center gap-4">
           <h3 className="flex">Select Session</h3>
            <select value={selectedSessionId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSessionId(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
                <option value="" disabled>Select a session</option>
                {sessions.map((session) => (
                    <option key={session.code} value={session.code}>
                        {session.name} - Status: {session.status}
                    </option>
                ))}
            </select>
            <button className="flex justify-center items-center bg-green-500 hover:bg-green-600
                             text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleLobbySession(selectedSessionId)}>
                        Go to Lobby
            </button>
            
            <button className="flex justify-center items-center bg-green-500 hover:bg-green-600
                             text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleStartSession(selectedSessionId)}>
                        Start Game
            </button>
            <button className="flex justify-center items-center bg-green-500 hover:bg-green-600
                             text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleDeactivateSession(selectedSessionId)}>
                        Deactivate
            </button>
            <button className="flex justify-center items-center bg-green-500 hover:bg-green-600
                             text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleStartRoundsLogic(selectedSessionId)}>
                        Start Round
            </button>
            
            
        </div>      
        </div>
        </>
    );
}

