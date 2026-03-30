/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentDeleted} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

// Setting global options for all V2 functions.
setGlobalOptions({ maxInstances: 10 });

/**
 * Trigger to delete all submissions when an assignment is deleted.
 */
export const onAssignmentDeleted = onDocumentDeleted("assignments/{assignmentId}", async (event) => {
    const assignmentId = event.params.assignmentId;
    const db = admin.firestore();
    const submissionsRef = db.collection("submissions");

    const snapshot = await submissionsRef.where("assignmentId", "==", assignmentId).get();

    if (snapshot.empty) {
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} submissions for assignment ${assignmentId}`);
});

// Import and export new grading triggers
export { onSubmissionCreated, onSubmissionUpdated } from "./grading";

import * as React from "react";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { sendEmail } from "./lib/email";
import { AssignmentCreatedEmail } from "./templates/AssignmentCreatedEmail";

const resendApiKey = defineSecret("RESEND_API_KEY");

/**
 * Trigger to send emails to all students when a teacher creates a new assignment.
 */
export const onAssignmentCreated = onDocumentCreated({
    document: "assignments/{assignmentId}",
    secrets: [resendApiKey]
}, async (event) => {
    const assignmentData = event.data?.data();
    if (!assignmentData) {
        return;
    }

    const db = admin.firestore();
    const teacherId = assignmentData.teacherId;
    
    if (!teacherId) {
        console.log("No teacherId found on assignment, skipping emails.");
        return;
    }
    
    // Find all students for this teacher
    const studentsSnapshot = await db.collection("users")
        .where("teacherId", "==", teacherId)
        .where("role", "==", "student")
        .get();
        
    if (studentsSnapshot.empty) {
        console.log(`No students found for teacher ${teacherId}, skipping emails.`);
        return;
    }
    
    console.log(`Sending assignment notification to ${studentsSnapshot.size} students.`);
    
    // Batch process emails to avoid timeouts on large classes
    const emailPromises = studentsSnapshot.docs.map(doc => {
        const student = doc.data();
        if (!student.email) return Promise.resolve();
        
        return sendEmail({
            apiKey: resendApiKey.value(),
            to: student.email,
            subject: `New Assignment Published: ${assignmentData.title || 'Assignment'}`,
            react: React.createElement(AssignmentCreatedEmail, {
                studentName: student.displayName || student.name || "Student",
                assignmentName: assignmentData.title || 'Assignment',
                link: `https://scorpioedu.org/student/assignments`
            })
        }).catch(err => {
            // Log but don't fail the entire batch if one email fails
            console.error(`Failed to email student ${student.email}`, err);
        });
    });
    
    await Promise.all(emailPromises);
    console.log(`Finished sending assignment creation emails for ${event.params.assignmentId}`);
});
