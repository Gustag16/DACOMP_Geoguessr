import useWebSocket, { ReadyState } from 'react-use-websocket';
import type { PlayerAvatarProps } from '../components/Lobby/PlayerAvatar';

const VITE_WS_URL = import.meta.env.VITE_WS_URL;

export function useSessionSocket(sessionCode: string, onMessage?: (data: any) => void) {
  const socketUrl = `${VITE_WS_URL}/lobby/${sessionCode}/`;
  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log('ws open'),
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

  function startRound() {
    sendMessage(JSON.stringify({ action: 'start_round' }));
  }


  function listPlayers() {
    sendMessage(JSON.stringify({ action: 'list_players' }));
  }

  function updateAvatar(playerId: string, avatarConfig: PlayerAvatarProps) {
    sendMessage(JSON.stringify({
      action: 'update_avatar',
      player: {
        id: playerId,
        avatar_config: avatarConfig
      }
    }));
  } 

  return {
    join,
    startRound,
    readyState,
    listPlayers,
    updateAvatar,
    isConnected: readyState === ReadyState.OPEN,
  };
}
