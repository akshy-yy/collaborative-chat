export type Role = 'principal_investigator' | 'supervisor' | 'reviewer' | 'postdoc' | 'phd_student' | 'co_author' | 'designer' | 'observer';
export type MessageType = 'chat' | 'feedback' | 'suggestion' | 'approval' | 'objection' | 'system';
export type ChangeCategory = 'improvement' | 'neutral' | 'potentially_degrading' | 'structural_change';
export type ConsensusStatus = 'pending' | 'auto_approved' | 'pending_vote' | 'accepted' | 'rejected';
export type ProjectStatus = 'active' | 'archived';
export type InstructionStatus = 'pending' | 'applied' | 'rejected';
export type DecisionStatus = 'accepted' | 'rejected' | 'pending';
export type VoteType = 'upvote' | 'downvote';
export type ExportFormat = 'json' | 'markdown' | 'pdf' | 'docx';

export interface User {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  invite_token: string;
  status: ProjectStatus;
  auto_approve_window_minutes: number;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  user: User;
  role: Role;
  joined_at: string;
}

export interface Room {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RoomMember {
  id: string;
  user: User;
  role: Role;
  joined_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  user: User | null;
  role: Role | null;
  content: string;
  message_type: MessageType;
  parent_id: string | null;
  change_category: ChangeCategory | null;
  consensus_status: ConsensusStatus;
  vote_deadline: string | null;
  upvotes: number;
  downvotes: number;
  user_vote: VoteType | null;
  priority_weight?: number;
  created_at: string;
}

export interface Instruction {
  id: string;
  project_id: string;
  room_id: string | null;
  instruction_type: string;
  target: string | null;
  action: string | null;
  payload: Record<string, unknown>;
  status: InstructionStatus;
  source_message_ids: string[];
  created_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  instruction_id: string | null;
  description: string;
  status: DecisionStatus;
  decided_at: string | null;
  decided_by: string | null;
  created_at: string;
}

export interface VoteBreakdownItem {
  role: Role;
  user_id: string;
  weight: number;
  vote: VoteType;
}

export interface WSJoinedEvent { type: 'joined'; user: { user_id: string; display_name: string; role: Role }; members: { user_id: string; display_name: string; role: Role }[]; room_id: string; }
export interface WSUserJoinedEvent { type: 'user_joined'; user: { user_id: string; display_name: string; role: Role }; }
export interface WSUserLeftEvent { type: 'user_left'; user_id: string; display_name: string; }
export interface WSMessageEvent { type: 'message'; message: Message; }
export interface WSTypingEvent { type: 'typing'; user_id: string; display_name: string; is_typing: boolean; }
export interface WSVoteUpdateEvent { type: 'vote_update'; message_id: string; upvotes: number; downvotes: number; consensus_status: ConsensusStatus; score: number; breakdown: VoteBreakdownItem[]; }
export interface WSVoteRequiredEvent { type: 'vote_required'; message_id: string; content: string; deadline: string; reason: string; }
export interface WSSystemEvent { type: 'system'; content: string; }
export type WSEvent = WSJoinedEvent | WSUserJoinedEvent | WSUserLeftEvent | WSMessageEvent | WSTypingEvent | WSVoteUpdateEvent | WSVoteRequiredEvent | WSSystemEvent;

export const ROLE_CONFIG: Record<Role, { label: string; weight: number; color: string; bgClass: string; description: string }> = {
  principal_investigator: { label: 'Principal Investigator', weight: 5, color: '#f59e0b', bgClass: 'role-bg-pi', description: 'Lab head, final authority on all figure decisions' },
  supervisor: { label: 'Supervisor', weight: 4, color: '#6366f1', bgClass: 'role-bg-supervisor', description: 'Senior advisor and mentor, high decision weight' },
  reviewer: { label: 'Reviewer', weight: 3, color: '#10b981', bgClass: 'role-bg-reviewer', description: 'External peer reviewer providing expert critique' },
  postdoc: { label: 'Postdoc', weight: 3, color: '#8b5cf6', bgClass: 'role-bg-postdoc', description: 'Postdoctoral researcher and senior co-author' },
  phd_student: { label: 'PhD Student', weight: 2, color: '#3b82f6', bgClass: 'role-bg-phd', description: 'Doctoral student, often the primary figure author' },
  co_author: { label: 'Co-author', weight: 2, color: '#06b6d4', bgClass: 'role-bg-coauthor', description: 'Contributing co-author and collaborator' },
  designer: { label: 'Designer', weight: 2, color: '#ec4899', bgClass: 'role-bg-designer', description: 'Scientific illustrator or visual designer' },
  observer: { label: 'Observer', weight: 0, color: '#6b7280', bgClass: 'role-bg-observer', description: 'Read-only participant, can comment but not vote' },
};

export const MESSAGE_TYPE_CONFIG: Record<MessageType, { label: string; color: string; bg: string }> = {
  chat: { label: 'Chat Message', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  feedback: { label: 'Feedback', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  suggestion: { label: 'Suggestion', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  approval: { label: 'Approval', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  objection: { label: 'Objection', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  system: { label: 'System', color: '#6b7280', bg: 'rgba(107,114,128,0.05)' },
};

export const CONSENSUS_CONFIG: Record<ConsensusStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#94a3b8' },
  auto_approved: { label: 'Auto-approved', color: '#10b981' },
  pending_vote: { label: 'Vote Required', color: '#f59e0b' },
  accepted: { label: 'Accepted', color: '#10b981' },
  rejected: { label: 'Rejected', color: '#ef4444' },
};
