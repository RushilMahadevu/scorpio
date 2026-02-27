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
