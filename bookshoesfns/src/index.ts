/* eslint-disable quotes */
/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { firebase } = require("firebase-admin");
const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const {
  onDocumentWritten,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const {
  getFirestore,
  FieldPath,
  FieldValue,
} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

exports.onBookWritten = onDocumentWritten(
  "clubs/{clubId}/books/{bookId}",
  (event: any) => {
    const data = event.data.after.data();
    const previousData = event.data.before.data();
    if (
      data?.scheduledMeetings?.sort().join(",") ===
      previousData?.scheduledMeetings?.sort().join(",")
    ) {
      return null;
    }

    if (!data.scheduledMeetings?.length) {
      return event.data.after.ref.update({ readStatus: "candidate" });
    }

    const scheduledMeetingsQuery = db
      .collection("clubs/" + event.params.clubId + "/meetings")
      .where(FieldPath.documentId(), "in", data.scheduledMeetings)
      .get();

    scheduledMeetingsQuery.then((scheduledMeetings: any) => {
      let readStatus = "candidate";
      if (scheduledMeetingsQuery.empty) {
        // If the query is empty, we know it the status should be 'candidate'
        logger.log("Candidate");
        return event.data.after.ref.update({ readStatus });
      }
      // If the query is not empty, we need to find out if the date is in the future or past to give it either a 'reading' or 'read' status
      readStatus = scheduledMeetings.docs.some(
        (doc: any) => doc.data().date.toDate() > new Date()
      )
        ? "reading"
        : "read";
      logger.log(readStatus);
      return event.data.after.ref.update({ readStatus });
    });

    return null;
  }
);

exports.onMeetingWritten = onDocumentWritten(
  "clubs/{clubId}/meetings/{meetingId}",
  (event: any) => {
    const data = event.data.after.data();
    const previousData = event.data.before.data();
    if (
      // If meeting date hasn't changed
      data?.date?.toDate() === previousData?.date?.toDate() &&
      // and scheduledBooks hasn't changed
      data?.scheduledBooks?.sort().join(",") ===
        previousData?.scheduledBooks?.sort().join(",")
    ) {
      // STOP
      return null;
    }

    let readStatus;
    if (data.date.toDate() > new Date()) {
      readStatus = 'reading';
    }
     ? "reading" : "read";
    if (data.scheduledBooks?.length) {
      return data.scheduledBooks.forEach((bookId) => {
        return db.doc(`clubs/${event.params.clubId}/books/${bookId}`).update({
          readStatus,
        });
      });
    }

    // const booksContainingMeetingQuery = db
    //   .collection("clubs/" + event.params.clubId + "/books")
    //   .where("scheduledMeetings", "array-contains", event.params.meetingId)
    //   .get();

    // booksContainingMeetingQuery.then((books: any) => {
    //   let readStatus = "candidate";
    //   if (booksContainingMeetingQuery.empty) {
    //     // If the query is empty, return null
    //     return null;
    //   }
    //   // If the query is not empty, we need to find out if the date is in the future or past to give it either a 'reading' or 'read' status
    //   if (data.date) {
    //     readStatus = data.date.toDate() > new Date() ? "reading" : "read";
    //   }
    //   return books.docs.forEach((doc: any) => {
    //     if (doc.data().readStatus === readStatus) {
    //       return null;
    //     }
    //     logger.log(doc.id, readStatus);
    //     return db.doc(`clubs/${event.params.clubId}/books/${doc.id}`).update({
    //       readStatus,
    //     });
    //   });
    // });

    return null;
  }
);

exports.onMeetingDeleted = onDocumentDeleted(
  "clubs/{clubId}/meetings/{meetingId}",
  (event: any) => {
    const booksContainingMeetingQuery = db
      .collection("clubs/" + event.params.clubId + "/books")
      .where("scheduledMeetings", "array-contains", event.params.meetingId)
      .get();

    booksContainingMeetingQuery.then((books: any) => {
      if (booksContainingMeetingQuery.empty) {
        // If the query is empty, return null
        return null;
      }
      // If the query is not empty, we need to reset the readStatus to candidate
      return books.docs.forEach((doc: any) => {
        logger.log(doc.id, "reset to candidate");
        return db.doc(`clubs/${event.params.clubId}/books/${doc.id}`).update({
          readStatus: "candidate",
        });
      });
    });
  }
);

exports.onBookDeleted = onDocumentDeleted(
  "clubs/{clubId}/books/{bookId}",
  (event: any) => {
    const meetingsContainingBookQuery = db
      .collection("clubs/" + event.params.clubId + "/meetings")
      .where("scheduledBooks", "array-contains", event.params.bookId)
      .get();

    meetingsContainingBookQuery.then((meetings: any) => {
      if (meetingsContainingBookQuery.empty) {
        // If the query is empty, return null
        return null;
      }
      // If the query is not empty, we need to reset the readStatus to candidate
      return meetings.docs.forEach((doc: any) => {
        return db
          .doc(`clubs/${event.params.clubId}/meetings/${doc.id}`)
          .update({
            scheduledBooks: FieldValue.arrayRemove(event.params.bookId),
          });
      });
    });
  }
);
