import useWebSocket, { ReadyState } from 'react-use-websocket';
import type { PlayerAvatarProps } from '../components/Lobby/PlayerAvatar';

const VITE_WS_URL = import.meta.env.VITE_WS_URL;

export function useSessionSocket(sessionCode: string, onMessage?: (data: any) => void) {
  const socketUrl = `${VITE_WS_URL}/lobby/${sessionCode}/`;
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log('ws open'),
    onClose: () => console.log('ws closed'),
    shouldReconnect: () => true,
        onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensagem recebida:', data); 
      if (onMessage) {
        onMessage(data);
      }
    },
  });

  function join(nickname: string, avatarConfig: PlayerAvatarProps) {
    sendMessage(JSON.stringify({
      action: 'join',
      player: { nickname, avatar_config: avatarConfig },
    }));
}

  function startRound() {
    sendMessage(JSON.stringify({ action: 'start_round' }));
  }


  function listPlayers() {
    sendMessage(JSON.stringify({ action: 'list_players' }));
  }


  return {
    join,
    startRound,
    readyState,
    listPlayers,
    isConnected: readyState === ReadyState.OPEN,
  };
}
