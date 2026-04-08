import type { NavigatorScreenParams } from '@react-navigation/native';

export type RoadmapsStackParamList = {
  RoadmapList: undefined;
  RoadmapDetail: { roadmapId: string; title: string; level?: string; description?: string };
  Topic: { topicId: string; title: string };
  Assessment: { roadmapId: string; title: string };
};

export type VacanciesStackParamList = {
  VacancyList: undefined;
  VacancyDetail: { id: string; title: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  DailyTasks: undefined;
  Friends: undefined;
  Verification: undefined;
  LevelDetermination: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Roadmaps: NavigatorScreenParams<RoadmapsStackParamList>;
  Vacancies: NavigatorScreenParams<VacanciesStackParamList>;
  Community: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
