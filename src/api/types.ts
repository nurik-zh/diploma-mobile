export type AuthUser = {
  id: number;
  email: string;
  firstLogin: boolean;
  createdAt: string;
  country: string;
  city: string;
  university: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Profile = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  joinedAt: string;
  country: string;
  city: string;
  university: string;
  firstLogin: boolean;
  completedTests: number;
  points: number;
  skills: string[];
  radarSkills: { id: string; label: string; value: number }[];
  achievements: string[];
};

export type Roadmap = {
  id: string;
  title: string;
  description: string;
  level: string;
  recommended: boolean;
};

export type RoadmapTree = Record<
  string,
  { id: string; title: string; status: string }[]
>;

export type VacancyListItem = {
  id: string;
  company: string;
  title: string;
  level: string;
  location: string;
  employment: string;
  salaryRange: string;
  tags: string[];
  summary: string;
  _count?: { realTasks: number };
};

export type CommunityPost = {
  id: string;
  title: string;
  content: string;
  focusArea: string;
  tags: string[];
  authorName: string;
  authorType: string;
  createdAt: string;
  likes: number;
  likedByUserIds: number[];
  comments: { id: string; text: string; authorName: string; createdAt: string }[];
};

export type DailyTask = {
  id: string;
  roadmapId: string;
  roadmapTitle: string;
  nodeId: string;
  nodeTitle: string;
  description: string;
  points: number;
  completed: boolean;
  quizData: Record<string, unknown> | null;
};

export type LeaderboardResponse = {
  leaders: {
    userId: number;
    fullName: string;
    points: number;
    rank: number;
    country: string;
    city: string;
  }[];
  currentUser: {
    userId: number;
    fullName: string;
    points: number;
    rank: number;
  };
};

export type RoadmapAssessmentQuizQuestion = {
  id: string;
  question: string;
  options: string[];
};

export type RoadmapAssessment = {
  roadmapId: string;
  sessionId: string;
  title: string;
  quizQuestions: RoadmapAssessmentQuizQuestion[];
  writtenQuestions: {
    id: string;
    text: string;
    placeholder?: string;
    hint?: string;
    keywords?: string[];
  }[];
};

export type UserSkillLevel = {
  roadmapId: string;
  levelLabel: string;
  score: number;
};

export type VerificationSlot = {
  id: string;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  location: string;
  assessor: string;
  seats: number;
};

export type VerificationBooking = {
  id: string;
  slotId: string;
  roadmapId: string;
  roadmapTitle: string;
  mode: string;
  date: string;
  time: string;
  dateTimeIso: string;
  location: string;
  assessor: string;
  status: string;
  bookedAt: string;
  completedAt?: string | null;
  certificateId?: string | null;
};

export type Friend = {
  userId: number;
  email: string;
  fullName: string;
  avatar: string;
  country: string;
  city: string;
  points: number;
  roadmapProgressPercent: number;
};

export type GlobalMap = {
  roadmaps: { roadmapId: string; title: string }[];
  participants: {
    userId: number;
    fullName: string;
    avatar: string;
    isCurrentUser: boolean;
    points: number;
    overallProgressPercent: number;
    roadmapProgress: Record<string, number>;
  }[];
};

export type FriendChallenge = {
  id: string;
  challengerUserId: number;
  opponentUserId: number;
  opponentName: string;
  roadmapId: string;
  roadmapTitle: string;
  challengerScore: number;
  challengerDurationSec: number;
  opponentScore: number | null;
  opponentDurationSec: number | null;
  winnerUserId: number | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  isNotificationRead: boolean;
};

export type FriendNotification = {
  id: string;
  challengeId: string;
  challengerName: string;
  roadmapTitle: string;
  createdAt: string;
};
