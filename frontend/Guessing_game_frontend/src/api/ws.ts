import useWebSocket, { ReadyState } from 'react-use-websocket';
import type { PlayerAvatarProps } from '../components/Lobby/PlayerAvatar';

const VITE_WS_URL = import.meta.env.VITE_WS_URL;
const dev = import.meta.env.DEV

const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const host = window.location.host;

export function useSessionSocket(sessionCode: string, onMessage?: (data: any) => void) {
  const socketUrl = dev 
    ? `${VITE_WS_URL}/lobby/${sessionCode}/` 
    : `${protocol}${host}/ws/lobby/${sessionCode}/`;
  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
    console.log('ws open');

    const playerId = localStorage.getItem("playerId");

      if (playerId) {
        sendMessage(JSON.stringify({
          action: "reconnect",
          player_id: playerId
        }));
      }
    },
    onClose: () => console.log('ws closed'),
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
      onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensagem recebida:', data); 
      if (onMessage) {
        onMessage(data);
      }
    },
  });

  function join(nickname: string, avatarConfig: PlayerAvatarProps, playerId?: string | null) {
    
    sendMessage(JSON.stringify({
      action: 'join',
      player: { 
        id: playerId || null, // Passa o ID se tiver (reconexão) ou null (primeira vez)
        nickname, 
        avatar_config: avatarConfig 
      },
    }));
  }

  function startRoundManual() {
    sendMessage(JSON.stringify({ action: 'start_round_manual', nickname: "ULTRAHOST" }));
  }


  function listPlayers() {
    sendMessage(JSON.stringify({ action: 'list_players' }));
  }

  function updateAvatar(playerId: string, avatarConfig: PlayerAvatarProps, nickname: string) {
    sendMessage(JSON.stringify({
      action: 'update_avatar',
      player: {
        id: playerId,
        avatar_config: avatarConfig,
        nickname: nickname
      }
    }));
  } 

  function sendGuess(latitude: number, longitude: number, guess_timestamp: number) {
    sendMessage(JSON.stringify({
      action: 'submit_guess',
      guess: {
        latitude: latitude,
        longitude: longitude,
        guess_timestamp: guess_timestamp
      }
    }));
  }

  function reconnect(playerId: string){
    sendMessage(JSON.stringify({
      action: 'reconnect',
      player_id: playerId
    }));
  }

  return {
    join,
    startRoundManual,
    readyState,
    listPlayers,
    updateAvatar,
    sendGuess,
    reconnect,
    isConnected: readyState === ReadyState.OPEN,
  };
}
