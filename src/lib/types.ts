import { Timestamp } from "firebase/firestore";

export type UserRole = "teacher" | "student" | "school_admin" | "super_admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  
  // Multi-tenancy & Network
  organizationId?: string; // Root organization/department ID
  
  // Primary Relationships
  teacherId?: string; // For students: direct link to primary teacher
  classIds: string[]; // List of /classes/{id} the user belongs to
  
  // Metadata
  createdAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string; // The primary teacher who manages the subscription
  ownerEmail?: string;
  stripeCustomerId?: string;
  subscriptionStatus: "active" | "past_due" | "canceled" | "none";
  planId: "free" | "pro_teacher" | "department_network";
  createdAt: Timestamp | Date;
}

export interface PhysicsAssignment {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  organizationId?: string;
  courseId: string;
  visibility: "private" | "network" | "global";
  questions: any[]; // Consider more specific type later
  createdAt: Timestamp | Date;
}
