import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import type { PlayerAvatarProps } from '../components/Lobby/PlayerAvatar';

const VITE_PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL?.trim().replace(/\/$/, '');
const VITE_WS_URL = import.meta.env.VITE_WS_URL?.trim().replace(/\/$/, '');
const dev = import.meta.env.DEV;

function resolveWsBaseUrl(): string {
  if (VITE_PUBLIC_URL) {
    const wsOrigin = VITE_PUBLIC_URL.replace(/^http/, 'ws');
    return wsOrigin.endsWith('/ws') ? wsOrigin : `${wsOrigin}/ws`;
  }
  if (dev && VITE_WS_URL) {
    return VITE_WS_URL;
  }
  const wsOrigin = window.location.origin.replace(/^http/, 'ws');
  return `${wsOrigin}/ws`;
}

export function useSessionSocket(sessionCode: string, onMessage?: (data: any) => void) {
  const socketUrl = `${resolveWsBaseUrl()}/lobby/${sessionCode}/`;
  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log('ws open');

      const playerId = localStorage.getItem("playerId");

      if (playerId) {
        sendMessage(JSON.stringify({
          action: "reconnect",
          player_id: playerId
        }));
      } else {
        sendMessage(JSON.stringify({
          type: "sync_request",
          action: "sync_request"
        }));
      }
    },
    onClose: () => console.log('ws closed'),
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    // Backoff exponencial: 1s, 2s, 4s, 8s... limitado a 30s
    reconnectInterval: (attemptNumber) => Math.min(1000 * Math.pow(2, attemptNumber), 30000),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') return;
      console.log('Mensagem recebida:', data);
      if (onMessage) {
        onMessage(data);
      }
    },
  });

  // Heartbeat a cada 25 segundos para manter o túnel Cloudflare ativo
  useEffect(() => {
    if (readyState !== ReadyState.OPEN) return;

    const interval = setInterval(() => {
      sendMessage(JSON.stringify({ type: 'ping', action: 'ping' }));
    }, 25000);

    return () => clearInterval(interval);
  }, [readyState, sendMessage]);

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
    const playerId = localStorage.getItem("playerId");
    sendMessage(JSON.stringify({
      action: 'submit_guess',
      player_id: playerId,
      guess: {
        latitude: latitude,
        longitude: longitude,
        guess_timestamp: guess_timestamp,
        player_id: playerId
      }
    }));
  }

  function reconnect(playerId: string){
    sendMessage(JSON.stringify({
      action: 'reconnect',
      player_id: playerId
    }));
  }

  function requestSync(playerId?: string | null) {
    sendMessage(JSON.stringify({
      type: 'sync_request',
      action: 'sync_request',
      player_id: playerId || localStorage.getItem("playerId")
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
    requestSync,
    isConnected: readyState === ReadyState.OPEN,
  };
}
