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
  polarCustomerId?: string; // Replaced Stripe with Polar
  subscriptionStatus: "active" | "past_due" | "canceled" | "none";
  planId: "free" | "standard_monthly" | "standard_yearly" | "pro_monthly" | "pro_yearly" | string;
  createdAt: Timestamp | Date;
  
  // AI Budgeting & Usage
  aiBudgetLimit: number; // Monthly budget in cents or "token units" (e.g. 500 = $5.00)
  aiUsageCurrent: number; // Current month's usage in same units
  baseMonthlyFee: number; // Flat fee for storage/base features
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
