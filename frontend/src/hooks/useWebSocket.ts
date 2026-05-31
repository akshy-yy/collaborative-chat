import { useEffect, useRef, useState, useCallback } from 'react';
import { useMessageStore } from '../store/messageStore';
import type { MessageType, VoteType, WSEvent } from '../types';

export function useWebSocket(roomId: string | undefined) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState<{ user_id: string; display_name: string; role: string }[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [voteRequired, setVoteRequired] = useState<{ message_id: string; content: string; deadline: string; reason: string } | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();
  const reconnectDelay = useRef(1000);

  const { addMessage, updateMessageConsensus } = useMessageStore();

  const connect = useCallback(() => {
    if (!roomId) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/${roomId}?token=${token}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      reconnectDelay.current = 1000;
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      reconnectTimeout.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
        connect();
      }, reconnectDelay.current);
    };

    ws.current.onerror = () => ws.current?.close();

    ws.current.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data);
        switch (data.type) {
          case 'joined':
            setOnlineMembers(data.members);
            break;
          case 'user_joined':
            setOnlineMembers(prev => [...prev.filter(m => m.user_id !== data.user.user_id), data.user]);
            break;
          case 'user_left':
            setOnlineMembers(prev => prev.filter(m => m.user_id !== data.user_id));
            break;
          case 'message':
            addMessage(data.message as any);
            break;
          case 'typing':
            if (data.is_typing) {
              setTypingUsers(prev => ({ ...prev, [data.user_id]: data.display_name }));
            } else {
              setTypingUsers(prev => { const n = { ...prev }; delete n[data.user_id]; return n; });
            }
            break;
          case 'vote_update':
            updateMessageConsensus(data.message_id, data.upvotes, data.downvotes, data.consensus_status as any);
            break;
          case 'vote_required':
            setVoteRequired({ message_id: data.message_id, content: data.content, deadline: data.deadline, reason: data.reason });
            break;
          default:
            break;
        }
      } catch { /* ignore parse errors */ }
    };
  }, [roomId, addMessage, updateMessageConsensus]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((content: string, message_type: MessageType, parent_id?: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'message', content, message_type, parent_id: parent_id || null }));
    }
  }, []);

  const sendTyping = useCallback((is_typing: boolean) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'typing', is_typing }));
    }
  }, []);

  const sendVote = useCallback((message_id: string, vote_type: VoteType) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'vote', message_id, vote_type }));
    }
  }, []);

  const dismissVoteRequired = useCallback(() => setVoteRequired(null), []);

  return { isConnected, onlineMembers, typingUsers, voteRequired, sendMessage, sendTyping, sendVote, dismissVoteRequired };
}
