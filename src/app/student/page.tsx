import { Metadata } from "next";
import StudentDashboard from "./page-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <StudentDashboard />;
}
