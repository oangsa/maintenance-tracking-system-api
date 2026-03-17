import { Department } from "./Department";

export interface User {
  id: number;
  email: string;
  passwordHash: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deleted: boolean;
  departmentId: number | null;

  department?: Department;
}
