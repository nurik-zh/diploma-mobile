import { apiRequest } from './client';
import type {
  AuthResponse,
  AuthUser,
  CommunityPost,
  DailyTask,
  Friend,
  FriendChallenge,
  FriendNotification,
  GlobalMap,
  LeaderboardResponse,
  Profile,
  Roadmap,
  RoadmapAssessment,
  RoadmapTree,
  UserSkillLevel,
  VerificationBooking,
  VerificationSlot,
  VacancyListItem,
} from './types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

export async function register(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { email, password, fullName: fullName || email.split('@')[0] },
    auth: false,
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/me');
}

export async function getProfile(): Promise<Profile> {
  return apiRequest<Profile>('/api/profile');
}

export async function getRoadmaps(): Promise<Roadmap[]> {
  return apiRequest<Roadmap[]>('/api/roadmaps');
}

export async function getRoadmapTree(): Promise<RoadmapTree> {
  return apiRequest<RoadmapTree>('/api/roadmaps/tree');
}

export async function getRoadmapCollection(): Promise<string[]> {
  return apiRequest<string[]>('/api/roadmaps/collection');
}

export async function updateRoadmapCollection(roadmapIds: string[]): Promise<string[]> {
  return apiRequest<string[]>('/api/roadmaps/collection', {
    method: 'POST',
    body: { roadmapIds },
  });
}

export async function removeRoadmapFromCollection(roadmapId: string): Promise<void> {
  await apiRequest(`/api/roadmaps/collection/${roadmapId}`, { method: 'DELETE' });
}

export async function getRoadmapAssessment(roadmapId: string): Promise<RoadmapAssessment> {
  return apiRequest<RoadmapAssessment>(`/api/roadmaps/${roadmapId}/assessment`);
}

export async function submitRoadmapAssessment(
  roadmapId: string,
  body: { theoryScore: number; writtenAnswers: { question: string; answer: string }[] }
): Promise<unknown> {
  return apiRequest(`/api/roadmaps/${roadmapId}/assessment/submit`, {
    method: 'POST',
    body,
  });
}

export async function getUserSkillLevels(): Promise<UserSkillLevel[]> {
  return apiRequest<UserSkillLevel[]>('/api/roadmaps/skill-levels');
}

export async function getVacancies(): Promise<VacancyListItem[]> {
  return apiRequest<VacancyListItem[]>('/api/vacancies', { auth: false });
}

export async function getVacancyById(id: string): Promise<unknown> {
  return apiRequest(`/api/vacancies/${id}`, { auth: false });
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  return apiRequest<CommunityPost[]>('/api/community', { auth: false });
}

export async function toggleLike(postId: string): Promise<void> {
  await apiRequest(`/api/community/${postId}/like`, { method: 'POST', body: {} });
}

export async function addComment(
  postId: string,
  text: string,
  authorName: string
): Promise<void> {
  await apiRequest(`/api/community/${postId}/comments`, {
    method: 'POST',
    body: { text, authorName, authorType: 'developer' },
  });
}

export async function createPost(body: {
  title: string;
  content: string;
  focusArea: string;
  tags: string[];
  authorName: string;
  authorType: string;
}): Promise<void> {
  await apiRequest('/api/community', { method: 'POST', body });
}

export async function getTodayTasks(): Promise<DailyTask[]> {
  return apiRequest<DailyTask[]>('/api/daily-tasks');
}

export async function submitDailyTask(taskId: string, optionId: string): Promise<unknown> {
  return apiRequest(`/api/daily-tasks/${taskId}/submit`, {
    method: 'POST',
    body: { optionId },
  });
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  return apiRequest<LeaderboardResponse>('/api/leaderboard');
}

export async function getFriends(): Promise<Friend[]> {
  return apiRequest<Friend[]>('/api/friends');
}

export async function addFriendByEmail(email: string): Promise<Friend[]> {
  return apiRequest<Friend[]>('/api/friends/add', { method: 'POST', body: { email } });
}

export async function removeFriend(friendId: number): Promise<Friend[]> {
  return apiRequest<Friend[]>(`/api/friends/${friendId}`, { method: 'DELETE' });
}

export async function getGlobalMap(): Promise<GlobalMap> {
  return apiRequest<GlobalMap>('/api/friends/map');
}

export async function getFriendChallenges(): Promise<FriendChallenge[]> {
  return apiRequest<FriendChallenge[]>('/api/friends/challenges');
}

export async function getFriendNotifications(): Promise<FriendNotification[]> {
  return apiRequest<FriendNotification[]>('/api/friends/challenges/notifications');
}

export async function markFriendNotificationRead(id: string): Promise<void> {
  await apiRequest(`/api/friends/challenges/${id}/read`, { method: 'PATCH', body: {} });
}

export async function createFriendChallenge(body: {
  opponentUserId: number;
  roadmapId: string;
  roadmapTitle: string;
  challengerScore: number;
  challengerDurationSec: number;
}): Promise<unknown> {
  return apiRequest('/api/friends/challenges', { method: 'POST', body });
}

export async function getVerificationSlots(): Promise<VerificationSlot[]> {
  return apiRequest<VerificationSlot[]>('/api/verification/slots');
}

export async function getVerificationBookings(): Promise<VerificationBooking[]> {
  return apiRequest<VerificationBooking[]>('/api/verification/bookings');
}

export async function createVerificationBooking(body: {
  slotId: string;
  roadmapId: string;
  roadmapTitle: string;
  mode: 'online' | 'offline';
  date: string;
  time: string;
  dateTimeIso: string;
  location: string;
  assessor: string;
}): Promise<VerificationBooking> {
  return apiRequest<VerificationBooking>('/api/verification/bookings', {
    method: 'POST',
    body,
  });
}

export async function cancelVerificationBooking(id: string): Promise<void> {
  await apiRequest(`/api/verification/bookings/${id}`, { method: 'DELETE' });
}

export async function getTopicContent(topicId: string): Promise<{ topicId: string; theory: string }[]> {
  return apiRequest(`/api/topics/${topicId}/content`);
}

export async function getTopicTest(topicId: string): Promise<{ questions?: unknown[] }> {
  return apiRequest(`/api/topics/${topicId}/test`);
}

export async function submitTopicResult(topicId: string, score: number): Promise<unknown> {
  return apiRequest(`/api/topics/${topicId}/submit`, {
    method: 'POST',
    body: { score },
  });
}
