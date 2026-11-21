export interface AuthenticatedUserRequest {
  user: { id: string; sessionId: string };
}
