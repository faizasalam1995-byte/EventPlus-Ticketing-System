# 🎬 EventPulse Final Video Walkthrough & Demonstration Script (3–5 Minutes)

> **Instructions for the Presenter**: Follow these exact 8 numbered steps in sequence during your 3–5 minute video recording or final oral viva presentation. This directly fulfills every grading criterion in the evaluation handbook.

---

### ⏱️ Step 1: Explain the Real-World Problem & Show Landing Page (0:00 - 0:40)
- **Speak**: *"Hello everyone! This is EventPulse — a full-stack event ticketing and check-in system designed to solve three major operational hurdles in live events: overselling beyond venue limits, fraudulent ticket sharing at entrance gates, and lack of real-time attendance visibility for organizers."*
- **Show**:
  - Point to the landing page at `http://localhost:5000` (or your deployed URL).
  - Highlight the live banner: **EventPulse PRO**, MongoDB Atlas indicator, WebSocket Live Gate engine, and 1-Click Role Switcher.
  - Show the 4 curated live events across Karachi, Lahore, and Islamabad.

---

### ⏱️ Step 2: Register or Sign In as Two Different Roles (0:40 - 1:15)
- **Speak**: *"EventPulse features strict Role-Based Access Control (RBAC) across three distinct roles: Attendee, Organizer, and Admin. Let's switch between roles using our 1-click test banner."*
- **Show**:
  - Click **Attendee** (`attendee@eventpulse.com`): Notice the attendee navigation (Explore Events, My Tickets, Pulse AI).
  - Click **Organizer** (`organizer@eventpulse.com`): Notice staff navigation unlocked (Check-In Gate Scanner, Attendance Dashboard, Publish Event).
  - Explain that Attendees are strictly blocked by JWT middleware from accessing gate check-in or organizer metrics.

---

### ⏱️ Step 3: Create a Record & Verify in Database-Backed List (1:15 - 2:00)
- **Speak**: *"Now as an Attendee, let's reserve a ticket using our simulated zero-friction checkout."*
- **Show**:
  - Switch to **Attendee** role.
  - Click **Register / Book Pass** on the *Masterclass: Modern Distributed Systems* (or *Global AI & Cloud Summit*).
  - Select the **Professional Pass** tier ($40).
  - Notice the reservation limits guard (max 3 tickets per booking enforced).
  - Click **Confirm Reservation (Simulated Checkout)**.
  - The server processes the booking, atomically decrements tier capacity, and creates a unique cryptographic ticket code (`EP-TK-XXXX-YYYY`).
  - The attendee is automatically routed to **My Tickets** showing their newly issued digital pass and high-resolution scannable QR code!
  - Click **View Pass & QR Code** to show the printable boarding-pass modal.

---

### ⏱️ Step 4: Main Business Workflow & Role Permissions (2:00 - 2:50)
- **Speak**: *"Now let's demonstrate the entrance gate check-in workflow and our strict one-time check-in enforcement."*
- **Show**:
  - Copy or note the newly issued ticket code (or click the 1-click test button).
  - Switch to **Organizer** role: Click **Check-In Gate**.
  - Enter the ticket code and select **Turnstile Gate A**.
  - Click **Verify Check-In**:
    - **First Scan**: Turns green! Returns `200 OK: Entry Verified! Welcome, Zainab Ahmed (Professional Pass). One-time pass activated.`
    - Audio chime rings, and the check-in is logged with timestamp and staff name.
  - **Duplicate Entry Fraud Attempt**:
    - Click **Verify Check-In** again with the EXACT SAME code.
    - Turns red! Returns `409 Conflict: Duplicate Entry Rejected! Ticket was ALREADY checked in at [Time] by Farhan Malik. Duplicate scan denied.`
    - Highlight that ticket pass-back fraud is completely eliminated!

---

### ⏱️ Step 5: Dashboard Figures Changing Based on Saved Data (2:50 - 3:30)
- **Speak**: *"Next, let's see how physical gate check-ins and ticket sales update organizer dashboard figures in real time."*
- **Show**:
  - Click **Attendance Dashboard**.
  - Select the active event from the dropdown.
  - Point to the live KPI cards:
    - **Venue Capacity**: Total seats.
    - **Tickets Sold**: Real-time sales count and % venue fill.
    - **Gate Check-Ins**: Live turnout count and attendance percentage (e.g. 78% turnout).
    - **Total Revenue**: Accrued ticket volume.
  - Point to the **Ticket Tier Performance Table** showing individual capacities vs sold vs physical check-ins.
  - Show the **Live Gate Stream** displaying incoming attendees chronologically.

---

### ⏱️ Step 6: Search/Filter, Input Validation & Handled Error (3:30 - 4:10)
- **Speak**: *"Now let's demonstrate input validation, search filtering, and handled capacity errors."*
- **Show**:
  - Go to **Explore Events**:
    - Type "Karachi" or "AI" into the live search bar: only matching events appear.
    - Filter by category ("Music & Festivals") or City ("Lahore"): instant client-side filtering.
  - Show **Handled Error (Capacity Exceeded / No Overselling)**:
    - Attempt to book more tickets than a tier's remaining capacity or max reservation limit: the UI immediately flags `Reservation limit exceeded for tier (Max allowed: X)`.
  - Go to **Check-In Gate**:
    - Enter a bogus fake ticket code like `EP-FAKE-9999`.
    - Server responds with handled `404 Not Found: "Ticket code not found in registry."`

---

### ⏱️ Step 7: GitHub Repository, Deployed URLs & API Documentation (4:10 - 4:40)
- **Speak**: *"Here is our engineering deliverable package."*
- **Show**:
  - Show the GitHub repository structure: clean monorepo with `server/` and `src/`.
  - Point to `http://localhost:5000/api/health` displaying JSON status: `online`, `EventPulse System`, `MongoDB Atlas Connected`.
  - Show `README.md` with the full Mermaid ER diagram and REST API endpoint specifications.

---

### ⏱️ Step 8: Optional AI Concierge & Real-Time BONUS Feature (4:40 - 5:10)
- **Speak**: *"Finally, let's highlight our bonus features: Pulse AI Event Concierge and WebSocket live feeds."*
- **Show**:
  - Click the **Pulse AI** button in the navbar.
  - Type: *"Show tech events in Karachi"* -> AI replies with the Global AI & Cloud Summit date, venue, and ticket tiers.
  - Type: *"What perks are in VIP Pass?"* -> AI provides a detailed breakdown of front-row seating, executive lounge access, and fast-track turnstile lanes.
  - Mention that WebSockets broadcast `ticket:booked` and `checkin:verified` across all connected browser tabs with zero page reloads!

---

**Wrap-up**: *"Thank you! EventPulse delivers a robust, secure, and synchronized ticketing and check-in system ready for production deployment."*
