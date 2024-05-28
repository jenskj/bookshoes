/* eslint-disable linebreak-style */
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
const {
  log,
  info,
  debug,
  warn,
  error,
  write,
} = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const {
  onDocumentWritten,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldPath } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

exports.updatebookreadstatus = onDocumentWritten(
  "clubs/{clubId}/books/{bookId}",
  (event: any) => {
    const data = event.data.after.data();
    const previousData = event.data.before.data();

    if (!previousData && !data.readStatus) {
      // Book has been added. Make it a candidate
      return event.data.after.ref.update({ readStatus: "candidate" });
    }
    
    if (
      // No changes to meeting list (which determines status). Stop updating.
      data?.scheduledMeetings?.sort().join(",") ===
      previousData?.scheduledMeetings?.sort().join(",")
    ) {
      return null;
    }

    if (!data.scheduledMeetings?.length) {
      // All meetings have been removed. Reset book to candidate status.
      return event.data.after.ref.update({ readStatus: "candidate" });
    }

    // Get a list of all meetings that the current book is scheduled for
    const scheduledMeetingsQuery = db
      .collection("clubs/" + event.params.clubId + "/meetings")
      .where(FieldPath.documentId(), "in", data.scheduledMeetings)
      .get();

    scheduledMeetingsQuery.then((scheduledMeetings: any) => {
      let readStatus = "candidate";
      if (scheduledMeetingsQuery.empty) {
        // If the query is empty, we know it the status should be 'candidate'
        return event.data.after.ref.update({ readStatus });
      }
      // If the query is not empty, we need to find out if the date is in the future or past to give it either a 'reading' or 'read' status
      readStatus = scheduledMeetings.docs.some(
        (doc: any) => doc.data().date.toDate() > new Date()
      )
        ? "reading"
        : "read";
      return event.data.after.ref.update({ readStatus });
    });

    return null;
  }
);

exports.onmeetingupdated = onDocumentUpdated(
  "clubs/{clubId}/meetings/{meetingId}",
  (event: any) => {
    const data = event.data.after.data();
    const previousData = event.data.before.data();
    if (data?.date?.toDate() === previousData?.date?.toDate()) {
      return null;
    }

    const booksContainingMeetingQuery = db
      .collection("clubs/" + event.params.clubId + "/books")
      .where("scheduledMeetings", "array-contains", event.params.meetingId)
      .get();

    booksContainingMeetingQuery.then((books: any) => {
      let readStatus = "candidate";
      if (booksContainingMeetingQuery.empty) {
        // If the query is empty, return null
        return null;
      }
      // If the query is not empty, we need to find out if the date is in the future or past to give it either a 'reading' or 'read' status
      if (data.date) {
        readStatus = data.date.toDate() > new Date() ? "reading" : "read";
      }
      return books.docs.forEach((doc: any) => {
        if (doc.data().readStatus === readStatus) {
          return null;
        }
        return db.doc(`clubs/${event.params.clubId}/books/${doc.id}`).update({
          readStatus,
        });
      });
    });

    return null;
  }
);

exports.onmeetingdeleted = onDocumentDeleted(
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
        return db.doc(`clubs/${event.params.clubId}/books/${doc.id}`).update({
          readStatus: "candidate",
        });
      });
    });
  }
);
