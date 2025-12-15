import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendMissedDeadlineEmail } from "@/lib/brevo";

// This script finds students who missed assignment deadlines and sends them an email.
// Intended to be run as a scheduled job (e.g., Vercel Cron, serverless function, or manually)

export default async function sendMissedAssignmentEmails() {
  const now = new Date();
  // Find assignments whose dueDate has just passed (e.g., in the last 10 minutes)
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const assignmentsSnap = await getDocs(
    query(collection(db, "assignments"), where("dueDate", ">=", tenMinutesAgo), where("dueDate", "<=", now))
  );

  for (const assignmentDoc of assignmentsSnap.docs) {
    const assignment = assignmentDoc.data();
    const assignmentId = assignmentDoc.id;
    // Find all students for this assignment (by teacherId)
    const studentsSnap = await getDocs(query(collection(db, "students"), where("teacherId", "==", assignment.teacherId)));
    // Find all submissions for this assignment
    const submissionsSnap = await getDocs(query(collection(db, "submissions"), where("assignmentId", "==", assignmentId)));
    const submittedStudentIds = new Set(submissionsSnap.docs.map((doc) => doc.data().studentId));
    for (const studentDoc of studentsSnap.docs) {
      const student = studentDoc.data();
      if (!submittedStudentIds.has(studentDoc.id)) {
        // await sendMissedDeadlineEmail(
        //   student.email,
        //   assignment.title,
        //   `/student/assignments/${assignmentId}`
        // );
        // Missed deadline email sending is currently disabled for development.
      }
    }
  }
}
