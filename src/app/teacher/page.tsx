import { Metadata } from "next";
import TeacherDashboard from "./page-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <TeacherDashboard />;
}
