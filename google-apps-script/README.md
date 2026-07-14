# Collect RSVPs in a Google Sheet

The RSVP form can post every response straight into a Google Sheet you own — no server, no paid service. It uses a **Google Apps Script Web App** as the (free) endpoint.

## Setup (about 5 minutes)

1. **Create the Sheet**
   - Go to <https://sheets.google.com> → **Blank spreadsheet**. Name it e.g. `Meby & Christy RSVPs`.
   - You don't need to add columns — the script creates them automatically.

2. **Add the script**
   - In that Sheet: **Extensions → Apps Script**.
   - Delete any starter code, then paste the entire contents of [`Code.gs`](Code.gs).
   - Click the **Save** (💾) icon.

3. **Deploy as a Web App**
   - Top-right: **Deploy → New deployment**.
   - Click the gear ⚙ next to "Select type" → choose **Web app**.
   - Set:
     - **Description:** `RSVP endpoint`
     - **Execute as:** **Me**
     - **Who has access:** **Anyone**  ← important, so guests' browsers can post.
   - Click **Deploy**. Approve the permission prompt (choose your Google account → *Advanced* → *Go to project (unsafe)* → *Allow*; this is normal for your own scripts).
   - Copy the **Web app URL** — it looks like:
     `https://script.google.com/macros/s/AKfycb..................../exec`

4. **Paste the URL into the site**
   - Open [`../js/script.js`](../js/script.js).
   - Find the `WEDDING` config near the top and set:
     ```js
     sheetEndpoint: "https://script.google.com/macros/s/AKfycb..../exec"
     ```
   - Save and re-deploy your site.

Done. Submit a test RSVP on the live site and watch a new row appear in the Sheet.

## Verify it's live
Open the Web app URL directly in a browser — you should see:
```json
{"result":"ok","message":"RSVP endpoint is live. POST to submit."}
```

## Good to know
- **Backup:** every response is also saved in the guest's browser (`localStorage`), so a momentary network hiccup never loses data.
- **No live confirmation from the server:** Apps Script can't send CORS headers, so the site posts in "fire-and-forget" (`no-cors`) mode and shows the "Thank you" screen optimistically. The row still gets written. This is the standard static-site → Sheets pattern.
- **Updating the script later:** after editing `Code.gs`, use **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy** so the same URL keeps working (no need to change `sheetEndpoint`).
- **Email alerts (optional):** to get an email per RSVP, add this line inside `doPost`, just before the `return json(...)`:
  ```js
  MailApp.sendEmail('you@example.com', 'New RSVP: ' + (data.name || ''),
    JSON.stringify(data, null, 2));
  ```
