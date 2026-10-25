# Wally MK 3: backend and going online

This folder already contains a working backend in `server/`. It does four jobs:

1. Serves the app (so one web address gives you both the site and its data).
2. Stores the ledger, wishlist, library, workspace and everything else, so phone and laptop share the same data.
3. Holds bank SMS that your phone posts, until the app collects them.
4. Reads product and title pages for the link scraper.

The app keeps working without it. Whenever the server is unreachable, everything is saved in the browser and merged later.

---

## Part 1: run it on your own computer (10 minutes)

1. Install Node.js 18 or newer from https://nodejs.org (the "LTS" download).
2. Open a terminal inside the `server` folder and run:

   ```
   npm install
   npm start
   ```

   You should see `Wally MK 3 server on port 3000`.
3. Open http://localhost:3000 in your browser. That is the app, served by your own backend.
4. In the app, press the shield button in the header, open **Cloud**, and press **Sync now**. The status should say Connected and your existing entries are copied to the server.

Locally the data is written to `server/data.json`. Keep that file; it is your database for now.

You can keep using Live Server (`127.0.0.1:5500`) as well. The app automatically talks to `localhost:3000` when it is opened locally.

---

## Part 2: put the code on GitHub

1. Create a free account at https://github.com and make a new repository (public is fine: the code holds no keys or passwords), for example `wally-mk2`.
2. Upload the whole project folder (everything next to `index.html`, including `server/` and `fitness/`).
   Do not upload `server/node_modules` or `server/data.json`. A `.gitignore` file is included that skips them.
3. If you use Git from the terminal instead:

   ```
   git init
   git add .
   git commit -m "Wally MK 3"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/wally-mk2.git
   git push -u origin main
   ```

---

## Part 3: a permanent database (Firebase Firestore)

Free hosts wipe local files whenever the server restarts, so `data.json` is not safe online. Firestore keeps the data permanently.

1. Go to https://console.firebase.google.com and create a project.
2. In the left menu open **Firestore Database** and create a database (production mode, any nearby region).
3. Open **Project settings → Service accounts → Generate new private key**. A `.json` file downloads. Treat it like a password.
4. Open that file in a text editor and copy its entire contents. You will paste it in the next part.

---

## Part 4: publish on Render

1. Create a free account at https://render.com and choose **New → Web Service**.
2. Connect your GitHub account and pick the `wally-mk2` repository.
3. Fill in:

   | Setting | Value |
   |---|---|
   | Root directory | leave empty |
   | Build command | `cd server && npm install` |
   | Start command | `node server/server.js` |
   | Instance type | Free |

4. Under **Environment variables** add:

   | Name | Value |
   |---|---|
   | `WALLY_KEY` | a long phrase only you know. This is the password for your data. |
   | `FIREBASE_SERVICE_ACCOUNT` | the full contents of the Firebase `.json` file |

5. Create the service. After a few minutes Render gives you an address like `https://wally-mk2.onrender.com`. That is your site.
6. Open it, press the shield button → **Cloud**, type your `WALLY_KEY`, press **Save key**. Do this once on each device.

Things to know about the free plan: the server sleeps after a period with no visits, and the first visit after that takes up to a minute to wake it. Your data is not affected.

Menu names on Render and Firebase change from time to time. If a label differs, look for the closest match.

---

## Part 5: use it on your phone

1. Open your Render address in Chrome on the phone.
2. Browser menu → **Add to Home screen** (or **Install app**).
3. Enter your key under shield → Cloud. The phone now shares data with the laptop.
4. Shield → Reminders → **Allow**, to get notifications.

### Automatic bank SMS

With the server online the phone no longer has to open the app. An automation app (MacroDroid, Tasker) can send each message straight to the server:

- Trigger: SMS received, containing `debited` or `credited`
- Action: HTTP request
  - Method: `POST`
  - URL: `https://YOUR-ADDRESS.onrender.com/api/sms?key=YOUR_WALLY_KEY`
  - Content type: `application/json`
  - Body: `{"text":"<the SMS text variable>"}`

The next time any of your devices opens the app, those messages are read and added to the ledger.

---

## How your data is kept safe

- **On each device:** a full copy is saved automatically once a day and before any purge, import or restore. Shield → Data vault lists them and can restore any one.
- **Backup file:** Shield → Data vault → Download full backup. Keep one somewhere outside the browser.
- **Syncing never deletes by accident:** ledger, wishlist and library are merged item by item. Something you delete on one device is removed on the others (after a safety copy), and Undo brings it back everywhere.
- **Everything else** (habits, planner, growth, fitness, notes) follows whichever device changed it last.
- **Not synced:** sketch drafts and your uploaded pictures stay on the device they were made on, because they are large.

## Server routes (for reference)

| Route | Purpose |
|---|---|
| `GET /api/health` | is the server up, which storage, is a key required |
| `GET /api/get-transactions`, `POST /api/add-transaction`, `DELETE /api/delete-transaction/:id` | ledger |
| `GET /api/get-wishlist`, `POST /api/add-wishlist`, `DELETE /api/delete-wishlist/:id` | wishlist and library |
| `GET /api/deleted`, `POST /api/undelete` | deletions shared between devices |
| `GET /api/get-workspace`, `POST /api/save-workspace` | workspace notes and sketch |
| `GET /api/state`, `PUT /api/state` | all other app data |
| `POST /api/sms`, `GET /api/sms-inbox`, `POST /api/sms-ack` | bank SMS drop-box |
| `POST /api/scrape-price`, `POST /api/scrape-media` | link scraper |
| `POST /api/jarvis-*` | AI routes. Not configured; the app uses its built-in analysis instead. |

## Live sync and keep-awake

- **Live sync:** every device keeps an open line to the server (`/api/events`) and also checks a cheap counter (`/api/rev`). A change on one device reaches the others in about a second or two while they have the app open. Edits and deletions travel too; where two devices changed the same entry, the later edit wins.
- **Keep-awake:** on Render the server visits its own address every 10 minutes so the free instance is not put to sleep. Render supplies `RENDER_EXTERNAL_URL` by itself. On another host set `KEEP_AWAKE_URL` to your site address. Set `KEEP_AWAKE=off` to turn it off. Look for `Keep-awake is on for …` in the log.
- **Database use:** the server keeps the lists in memory and only writes changes to Firestore, so frequent checks do not use up the free read quota.
- **When you update the app,** upload `app.js`, `sw.js` and `server/server.js` together. They depend on each other.

## Giving C.A.S.P.E.R. an AI (optional)

Without a key the chat uses its built-in commands only. To let it answer open questions, add ONE of these in Render → your service → Environment, then let it redeploy:

| Variable | Service | Where to get the key |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude (Anthropic) | console.anthropic.com → API keys. Paid, billed per use. |
| `GEMINI_API_KEY` | Gemini (Google) | aistudio.google.com → Get API key. Has had a free tier; check current terms. |
| `OPENAI_API_KEY` | OpenAI, or any compatible service | Also set `OPENAI_BASE_URL` for a compatible service. |

- `CHAT_MODEL` (optional) picks the model. Defaults: `claude-haiku-4-5-20251001`, `gemini-2.5-flash`, `gpt-4o-mini`. If the service says the model does not exist, set this to a current model name from its documentation.
- The key stays on the server. The chat header shows "AI online" when it is working, and shield → Cloud shows which service is in use.
- What is sent with each question: your message, the last few chat turns, and a summary of your data (balances, this month's totals, recent entries, open tasks, habits, wishlist, holdings, weather). That summary goes to the AI company you chose.

## Checking that the server stays awake

Shield → Cloud shows "Server awake for …" and the number of keep-awake visits. Open the app after leaving it closed for a few hours: if "awake for" is longer than the time you were away, the server did not sleep. For a second layer, point a free uptime monitor at `https://YOUR-ADDRESS/api/health` every 10 minutes.

## Password gate

The whole site sits behind a sign-in page. Until the password is given, the server sends nothing but that page: not the app, not the fitness app, not your data.

| Variable | What it is |
|---|---|
| `SITE_PASSWORD` | The password you type to open the site. If it is not set, `WALLY_KEY` is used as the password. |
| `WALLY_KEY` | The machine key used inside bookmarks and SMS automation links (`?key=…`). Keep it different from the password. |
| `SITE_GATE=off` | Turns the sign-in page off and protects only the data routes with `WALLY_KEY`. Not recommended. |

- A correct password keeps that device signed in for 30 days. Sign out from shield → Cloud.
- Eight wrong tries from one address lock sign-in for 15 minutes.
- Changing `SITE_PASSWORD` or `WALLY_KEY` signs every device out.
- After signing in you do not need to type the key under shield → Cloud any more.
- Your Gemini and Firebase keys live only in Render's environment settings and are never sent to the browser.
- The gate cannot protect a phone or laptop that is already unlocked and signed in, and the copy the app keeps on the device for offline use can be opened without the network. Use the device's own screen lock.

## Changing the password from inside the app

Shield → Cloud → **Change password**. Type the current password and the new one twice.

- The new password is stored salted and hashed in the database, never as plain text, and takes over from `SITE_PASSWORD`.
- Every other device is signed out; the one you changed it on stays signed in.
- Forgot it: add `SITE_PASSWORD_RESET` = `1` in Render. The stored password is ignored and `SITE_PASSWORD` works again. Sign in, set a new one, then remove that variable.

## If the AI is busy

When Google answers "high demand", the server waits and retries twice, then tries the other Flash models your key can use. To choose the backups yourself, set `CHAT_FALLBACK_MODELS` to a comma-separated list of model names.

## Keeping a public repository safe

The repository holds only code. Every secret lives in Render → Environment, which GitHub never sees:

| Secret | Where it lives |
|---|---|
| `SITE_PASSWORD` / the password you set in the app | Render settings / your database, stored hashed |
| `WALLY_KEY` (master key) | Render settings only. Do not paste it anywhere else. |
| `GEMINI_API_KEY` | Render settings only |
| `FIREBASE_SERVICE_ACCOUNT` | Render settings only |

`.gitignore` blocks `.env` files, Firebase key files and local data files from being committed by accident. Before every upload, check that you are not adding a `.json` key file or a `.env` file.

### What the site does to protect itself

- **Password on every window.** A new tab, a new browser session, or opening the installed app asks for the password. Reloading the same tab does not. The lock button in the header (padlock) locks the current window; 15 minutes away or idle locks it too.
- **Session ends with the browser.** The sign-in cookie is never saved to disk as a long-term login and lasts at most 12 hours.
- **Capture key.** Bookmarks and phone automation use a separate capture key (shield → Cloud). It can only add bookmarks and bank messages; it cannot read or change anything. The master `WALLY_KEY` is no longer kept in the browser.
- **Your site only.** Other websites cannot call your API, and cannot add items in your name while you are signed in.
- **Content Security Policy.** Pages may only load code from the app itself and the few libraries it uses, and may only talk to the services listed. Set `CSP=off` in Render if a feature stops loading, then tell me which.
- **Status page.** `/api/health` shows only "up" to anyone not signed in.
- **Guessing.** Eight wrong passwords from one address wait 15 minutes.

Limits worth knowing: anyone using your unlocked, signed-in device sees everything; the libraries loaded from public CDNs (Tailwind, Chart.js, icons) are trusted as served.

## AI trainer (LEVEL//UP → AI Trainer)

Uses the same AI key as the chat. Without a key it still works with built-in rules: a plan builder, an Indian food list and offline coach answers. Photo food logging needs the AI. Everything it stores (profile, plan, logs, coach memory) is kept inside the fitness data, so it syncs between your devices like the rest.

## Purging data (a real clean slate)
Dashboard → red bin above the ledger, or shield → **Purge data…**. Choose **Ledger only** or **Everything**, type PURGE and your sign-in password.
- The server copy is deleted at once, and a "purge moment" is stored in the database.
- Every other device wipes itself the next time it syncs (within seconds if it is open). A device that was offline cannot bring the old data back: the server refuses anything older than the purge moment.
- The built-in sample ledger is never loaded again after a purge.
- Your password, keys, weather place and pictures are kept. Tick "Download a full backup first" if you want a safety copy.

## Self-check
Dashboard → **✓ Self-check** (right end of the section bar), or shield → **Run a full self-check**. It tests the server and its version, the password gate, the database (write and read), keep-awake, sync, the live line, the capture key, the bookmark route, the SMS drop-box (a dry run, nothing stored), the SMS reader, the link reader, weather, the price relay, notifications, offline copy and storage. **Include AI** also sends one test question to Gemini. Each failed line says what to fix.

## How the capture tools work
- **Capture bookmark (wishlist / library):** drag it from shield → Capture to your bookmarks bar. On a shop page, tap it: it reads the title, price and picture from the page you are on (inside your browser, so shops cannot block it) and sends them to your server with your capture key. Every device gets the item through sync. On a phone, add it as a bookmark and pick it from the bookmarks list while on the product page.
- **Link reader ("scraper"):** paste a link in Wishlist or Library. The server fetches the page and pulls the title, price and image. Large shops (Amazon, Flipkart) often block servers, so if it comes back empty use the capture bookmark, which always works.
- **Auto SMS reader:** the phone posts each bank message to `https://YOUR-SITE/api/sms?key=CAPTURE-KEY` (Android: an SMS-forwarder or Tasker/MacroDroid "HTTP POST" with the message as `text`; iPhone: a Shortcuts automation on "Message received"). The server holds them; the first open device files each one into the ledger (amount, in or out, who with, date, category) and clears it from the box. OTPs, offers, "will be debited" reminders and balance-only messages are ignored, and repeats are recognised. The exact address and key are under shield → Cloud.

## Making it faster (latency)
- Sync now takes one trip each way, and app files are sent compressed and only re-sent when they change.
- The biggest remaining delay is distance. Render's free services in **Oregon/Ohio** add about 250 ms per trip from India; a service in **Singapore** cuts that to about 60–90 ms. Render cannot move an existing service: create a new Web Service from the same repo, pick region Singapore, copy the same environment settings, and use its new address. Your data lives in Firestore, so nothing is lost.
- Keep-awake (automatic on Render) stops the 30–60 s cold start.

## Round 16: clean ledger and encrypted storage
- **One-time clean ledger.** The first time the new server starts, it deletes every ledger entry on the server once, and each device wipes its ledger the next time it opens. Wishlist, library, planner, habits, notes and fitness stay. It never runs again after that, so anything you add from then on is kept. (To skip it, set `LEDGER_RESET=off` in Render *before* deploying.)
- **The built-in sample ledger is gone from the code.** It was your own spending history sitting in a public repository. Old commits on GitHub still contain it; if that matters, make the repository private (GitHub → Settings → General → Danger zone → Change visibility). The app works the same either way.
- **Encryption at rest.** Every record is now compressed and sealed with AES-256-GCM before it is stored in Firestore. Someone who sees your database sees only scrambled text, and any tampering is detected. Old records are sealed automatically on the first start.
  - The key comes from `DATA_KEY` if you set one in Render, otherwise from `WALLY_KEY`. **Never change or delete that value**: records sealed with the old key cannot be opened (they are kept, not destroyed, so putting the old value back recovers them).
  - Self-check shows "encrypted" in the server details.
- **Purge, fixed.** The purge moment is now written before anything is deleted, deletion runs in parallel (fast on Firestore), and a device whose copy is older than the purge is refused outright, so nothing can sneak back in while the purge runs.
- **LEVEL//UP → Settings → RESET VESSEL** now resets on every device instead of pulling the old progress back.

## Notifications
The bell opens the notification centre:
- **Inbox:** new alerts at the top, then earlier today and this week, with "Coming up" for the next few reminders. Opening the panel marks everything read, so the red dot disappears straight away, and the read state syncs, so it disappears on your other devices too. ✕ dismisses one; "Clear all" dismisses the lot. Tap an alert to open the page it is about.
- **Reminders:** your own reminders: text, time, once / daily / weekdays / weekends / chosen days / monthly, an optional note, and which page it opens. Quick presets, an on/off switch, "+1 h" snooze and delete. Each shows when it fires next.
- **Settings:** pop-up permission and test, a master switch, the automatic reminders (morning brief, bills, tasks, mood, habits, fitness quest) and their times.

## C.A.S.P.E.R. Capture (bookmarks), round 17
Top of the Wishlist and Library pages.
1. **Drag "⇪ Send to C.A.S.P.E.R." to your bookmarks bar** (Ctrl + Shift + B shows the bar). It is one bookmark for everything: film, series, anime and book sites (IMDb, Letterboxd, Goodreads, MyAnimeList, Netflix, Prime Video, Hotstar…) go to the Library, everything else to the Wishlist. The "Wishlist only" / "Library only" buttons are there if you prefer fixed ones.
2. On a product or title page, click it. It reads the address, the page's product data, the `og:image` picture, the title and the price right on the page.
3. A small window opens on your server at `/api/bookmark-auto` (or `/api/bookmark-media-auto`). It saves at once, says "Saved", and closes itself. If the price or title is missing, it shows a short form instead (with a Wishlist / Library switch); press Save and it closes. If your browser blocks the window, the same tab goes there and comes back.
4. Every open device gets the item within about a second, with a toast and a bell notification; it appears under **Recently captured**.
- The bookmark carries your capture key, which can only add items. **Re-drag it after you sign in** on a new setup, or after changing `WALLY_KEY`. Old bookmarks from earlier rounds still work, but drag the new one to get the smart routing.
- Phone: "Copy for phone", bookmark any page, edit it, paste the code as the address; on a product page, type the bookmark's name in the address bar and tap it.
- "Try the save window" opens the form with a test item; nothing is saved unless you press Save.

## Round 18: prices, priorities, savings plan, info buttons
- **Prices read from the page you see.** The bookmark now takes, in order: Amazon's own price box; a "Buy at ₹…" button (Flipkart); the biggest visible ₹ amount near the product name that is not crossed out and not inside an ad, "similar products" or offers strip (Myntra, The Souled Store, most shops); and only then the hidden product data. Hidden product data is what gave Flipkart its wrong prices.
- **Names:** junk titles like "… Landing Page At Store Online" or Amazon's "Product summary presents key product information" are skipped in favour of the real product heading. Myntra joins brand and product name.
- **Updating a price:** click the bookmark again on the same product page. The item's price is updated (no duplicate), the window says "Price updated: was ₹X, now ₹Y", and the card shows "↓ ₹79 since last check".
- **When the server reads a link** (the form, or Auto-Fetch), shops often show servers a different price or block them. The form now says so and asks you to check it. Blocked pages are no longer read as if they were the product.
- **Priority:** each Wishlist card has a High / Normal / Low dropdown. It decides the buy order (High first, then cheapest). Library cards have Up next / Normal / Someday, and Up next titles are listed first.
- **Savings plan:** the "SAVINGS PLAN ₹ / MO" box at the top of the Wishlist now works (it was calling a function that did not exist) and syncs to your devices. Type how much you put aside for the wishlist each month and press Enter. Every card then shows its place in the buy order and the date you can afford it. "Whole cart cleared in" is how long until you could buy everything at that rate; money in "Already saved for cart" counts first. With no plan set, it uses what you have usually saved a month (income minus spending, last three months) and says "estimate".
- **Info buttons (?)** on every heading, tile and field across Dashboard, Investments, Wishlist, Library, Workspace, Growth and Planner. Hover on a laptop, tap on a phone.

## Round 19
- **Weekly spend monitor** (Dashboard, under Insights; "Weekly" in the section bar). Set your weekly limit in the box (₹ / week) and press Enter. *12 weeks* shows stacked bars by category with your limit as a dashed red line and a cyan 4-week average; tap a bar for that week's split-up. *This week* shows each day stacked by category, with "spent so far" against an even pace to your limit. The tiles show what is left, what you can spend per day from now, where this pace ends the week, and the change against last week on the same days. Alerts (toast and bell) at 80% and 100%.
- **Password, enforced on the server too.** Every open window pings the server. Opening the site again after every window has been gone for 90 seconds always shows the sign-in page, whatever the browser restores or caches. (`PAGE_IDLE_SEC` in Render changes the 90 seconds.) Inside an open window, switching to another tab or app for more than 30 seconds also asks (change it under shield → Cloud; "any time" makes it ask on every switch). The link the sign-in page sends you to now works once only.
- **Purge** always clears the server copy when the app runs from your server (it used to skip it on a device that had never synced), says clearly if the sign-in has expired, and was tested against a slow database while another device kept adding entries: nothing came back.
- **Check what Render is running:** open `https://YOUR-SITE/api/health`. It must say `"version":"mk3-r19"` and `"lock":4`. If it shows an older version, the new `server/server.js` was not pushed or Render's deploy failed (Render → your service → Events / Logs).

## Round 20
- **Monthly budget editor:** tap the Safe-to-spend tile, or the green "Budget ₹… ✎" chip on the Money section. Choose every month or only this month. The editor shows the sum: budget − spent = left, your cash, and safe to spend per day. (The original "set budget" button saved under the month filter "all", which nothing read; it now opens this editor.) Budget changes reach your other devices without a reload.
- **Dashboard sections:** 01 Today, 02 Money, 03 Charts and spending (Macro scanners, Weekly monitor, Insights), 04 Ledger, 05 Tools. Tap a section's header to fold it away; each device remembers what you folded.
- **⚡ Smooth** (in the section bar): turns off the glass blur, the moving background and the spinning rings, and chart animations. On by default on phones and tablets.
- **Devices showing different data:** shield → Cloud → "Make every device match this one" (on the device that is right; asks for your password) or "Reload this device from the server" (on the device with old data).
- **Auto-update:** a device running an older copy of the app than the server updates itself when you open it.

## Round 21
- **Every figure fits:** micro-telemetry values, cashflow amounts and allocation figures shrink to fit, and any label that would be cut off wraps instead.
- **Info (?)** on all six micro-telemetry cards: Health, Daily Burn, Velocity, Liabilities, Runway, Top Expense.
- **Period bar** above Macro Scanners: This month · Last month · All time · pick any month. It drives every chart (and the page filter).
- **Month Race:** choose both months (e.g. Oct vs Jul), with an even-pace line to your budget, the budget line, and a "Budget ✎" button to change it.
- **Charts retired** (they repeated others): Savings Velocity (= Savings Rate), Distribution (= Category Spread), Balance Curve (= Cumulative Wealth). **New:** Cash Runway Forecast (90-day projection with the day cash would run out), Plan vs Actual (50/25/20/5 buckets for the month), Fixed vs Variable (recurring costs against everyday spending, 6 months).
- **All-time line** (7-Day Cashflow → ALL-TIME LINE): every day since your first entry, scrollable sideways; ranges and month chips; a searchable list of every transaction grouped by month with totals. Tap a day to jump to its entries.
- **Period Cashflow** has its own month picker (independent of the page filter; "Follow page filter" restores the old behaviour).
- **C.A.S.P.E.R. chat:** minimise (—), maximise (⤢ or double-click the title), and a red dot with a count on the chat button when an answer arrives while it is closed or minimised.
- **Arc reactor** redrawn: 10-coil toroid, rotating rings, inverted triangle core. **Blueprint theme:** drafting grid, drawing title blocks on each section (DWG · REV · SCALE), engineering callouts.

## Round 22 (mk3-r22)
- Category Pie is back in the chart deck (it was the "Distribution" chart, retired by mistake in r21).
- Blueprint title blocks (DWG / REV / SCALE) and rulers removed; calmer design with round section badges, gradient underlines, a quieter grid and hover states.
- New boot screen: the arc reactor assembles while the app loads (once per tab session; tap to skip). The server puts it in the page itself so it appears on the very first frame.
- Sign-in page and header/footer logos are now live arc reactors with the inverted triangle.
- Check: `/api/health` shows `"version":"mk3-r22"`.
- Reactor triangle nudged up so it sits dead-centre in the rings (header, footer, boot and sign-in).
