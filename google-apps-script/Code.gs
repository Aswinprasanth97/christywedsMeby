/**
 * RSVP → Google Sheet endpoint for the Meby & Christy wedding site.
 *
 * Paste this into the Apps Script editor attached to your Google Sheet
 * (Extensions → Apps Script), then Deploy as a Web App.
 * Full steps: see README.md in this folder.
 */

var SHEET_NAME = 'RSVPs';
var HEADERS = ['Timestamp', 'Name', 'Mobile', 'Email', 'Attending', 'Guests', 'Message'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // avoid two submissions writing the same row

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Write the header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Body may arrive as JSON (text/plain) or as form parameters.
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); }
      catch (err) { data = (e && e.parameter) || {}; }
    } else {
      data = (e && e.parameter) || {};
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.mobile || '',
      data.email || '',
      data.attending || '',
      data.guests || '',
      data.message || ''
    ]);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the Web App URL in a browser to confirm it's live.
function doGet() {
  return json({ result: 'ok', message: 'RSVP endpoint is live. POST to submit.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
