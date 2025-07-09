export enum UserRole {
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
    USER = 'user'
  }
  
  export interface User {
    id: number;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }
  