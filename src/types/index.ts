export type ApiUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  college: string | null;
  goals: string[];
  roles: string[];
  isOnline: boolean;
  skills: { id: string; level: string; skill: { id: string; name: string; category: string | null } }[];
  matchScore?: number;
  connectionStatus?: "none" | "pending_sent" | "pending_received" | "connected";
};

export type ApiTeam = {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  maxMembers: number;
  lookingForRoles: string[];
  isOpen: boolean;
  members: { id: string; role: string; user: { id: string; name: string; avatarUrl: string | null; username: string } }[];
  event?: { id: string; title: string } | null;
};

export type ApiEvent = {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  isOnline: boolean;
  location: string | null;
  tags: string[];
  organizer: { id: string; name: string };
  _count?: { participants: number; teams: number };
};

export type ApiNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type ApiConversation = {
  id: string;
  isGroup: boolean;
  name: string | null;
  updatedAt: string;
  participants: { user: { id: string; name: string; avatarUrl: string | null; isOnline: boolean } }[];
  lastMessage?: { content: string; senderId: string; createdAt: string } | null;
  unreadCount?: number;
};