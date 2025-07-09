import { UserRole } from "../../features/models/user.model";

export interface AuthResponse {
    access_token: string;
    user: {
    id: number;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    };
  }
  