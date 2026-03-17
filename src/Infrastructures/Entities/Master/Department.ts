import { department } from "../../Database/Drizzle/schema";

export interface Department {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deleted: boolean;
}
