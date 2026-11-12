jest.mock("@/lib/firebase", () => ({ db: {}, auth: {} }));
jest.mock("firebase/firestore", () => ({ doc: jest.fn(), onSnapshot: jest.fn() }));
jest.mock("@/contexts/auth-context", () => ({ useAuth: jest.fn() }));

import { isOnDepartmentPlan } from "@/components/department-banner";

describe("isOnDepartmentPlan helper", () => {
  test("returns false when organization is null or undefined", () => {
    expect(isOnDepartmentPlan(null)).toBe(false);
    expect(isOnDepartmentPlan(undefined)).toBe(false);
  });

  test("returns false when organization has no planId or planId is 'free'", () => {
    expect(isOnDepartmentPlan({})).toBe(false);
    expect(isOnDepartmentPlan({ planId: "" })).toBe(false);
    expect(isOnDepartmentPlan({ planId: "free" })).toBe(false);
    expect(isOnDepartmentPlan({ planId: "free", subscriptionStatus: "active" })).toBe(false);
  });

  test("returns false when subscriptionStatus is not active or trialing", () => {
    expect(isOnDepartmentPlan({ planId: "standard_monthly", subscriptionStatus: "canceled" })).toBe(false);
    expect(isOnDepartmentPlan({ planId: "standard_monthly", subscriptionStatus: "past_due" })).toBe(false);
    expect(isOnDepartmentPlan({ planId: "standard_monthly", subscriptionStatus: "none" })).toBe(false);
  });

  test("returns true for active paid department plans", () => {
    expect(isOnDepartmentPlan({ planId: "standard_monthly", subscriptionStatus: "active" })).toBe(true);
    expect(isOnDepartmentPlan({ planId: "standard_yearly", subscriptionStatus: "active" })).toBe(true);
    expect(isOnDepartmentPlan({ planId: "department_monthly", subscriptionStatus: "active" })).toBe(true);
    expect(isOnDepartmentPlan({ planId: "department_yearly", subscriptionStatus: "active" })).toBe(true);
    expect(isOnDepartmentPlan({ planId: "pro_monthly", subscriptionStatus: "active" })).toBe(true);
  });
});
