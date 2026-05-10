export type Role = "parent" | "kid" | "admin";

export interface AppUser {
  id: string;
  email: string;
  role: Role;
}
