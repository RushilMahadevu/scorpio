import { adminDb, type firestore } from "@/lib/firebase-admin";

export async function findClassByCode(code: unknown, transaction?: firestore.Transaction) {
  if (typeof code !== "string" || !code.trim() || code.length > 128 || code.includes("/")) return null;

  function lookup(value: string) {
    const query = adminDb.collection("courses").where("code", "==", value).limit(1);
    return transaction ? transaction.get(query) : query.get();
  }

  const exactCode = code.trim();
  const uppercaseCode = exactCode.toUpperCase();
  let course = (await lookup(exactCode)).docs[0];
  if (!course && exactCode !== uppercaseCode) course = (await lookup(uppercaseCode)).docs[0];
  if (!course) return null;

  const { teacherId, name } = course.data();
  if (typeof teacherId !== "string" || !teacherId || teacherId.includes("/")) return null;

  const teacherRef = adminDb.collection("users").doc(teacherId);
  const teacher = (transaction ? await transaction.get(teacherRef) : await teacherRef.get()).data();
  if (teacher?.role !== "teacher" || typeof teacher.organizationId !== "string" || !teacher.organizationId) return null;

  return { courseId: course.id, name: typeof name === "string" ? name : "Class", teacherId, organizationId: teacher.organizationId };
}
