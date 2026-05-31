import { create } from 'zustand';
import { messagesApi } from '../api/messages';
import type { Message, ConsensusStatus, VoteType } from '../types';

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  fetchMessages: (roomId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessageConsensus: (messageId: string, upvotes: number, downvotes: number, consensus_status: ConsensusStatus) => void;
  updateUserVote: (messageId: string, vote: VoteType) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  isLoading: false,

  fetchMessages: async (roomId) => {
    set({ isLoading: true });
    try {
      const messages = await messagesApi.list(roomId);
      set({ messages, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  addMessage: (message) => set(state => {
    if (state.messages.some(m => m.id === message.id)) return state;
    return { messages: [...state.messages, message] };
  }),

  updateMessageConsensus: (messageId, upvotes, downvotes, consensus_status) =>
    set(state => ({
      messages: state.messages.map(m =>
        m.id === messageId ? { ...m, upvotes, downvotes, consensus_status } : m
      ),
    })),

  updateUserVote: (messageId, vote) =>
    set(state => ({
      messages: state.messages.map(m => m.id === messageId ? { ...m, user_vote: vote } : m),
    })),

  clearMessages: () => set({ messages: [] }),
}));
