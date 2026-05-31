import apiClient from './client';
import type { Message, MessageType } from '../types';

export const messagesApi = {
  list: (roomId: string, skip = 0, limit = 100) =>
    apiClient.get<Message[]>(`/rooms/${roomId}/messages/`, { params: { skip, limit } }).then(r => r.data),
  clearRoom: (roomId: string) =>
    apiClient.delete(`/rooms/${roomId}/messages/`).then(r => r.data),

  vote: (messageId: string, vote_type: 'upvote' | 'downvote') =>
    apiClient.post(`/messages/${messageId}/vote/`, { vote_type }).then(r => r.data),
};
