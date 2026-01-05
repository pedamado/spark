PRD.md (Product Requirements Document)

```markdown
# Product Requirements Document (PRD)
## Conference Program Web App

### 1. Introduction
**Product Name:** Dynamic Conference Program Parser  
**Purpose:** To provide a cost-effective, maintainable, and reusable digital program for multi-day, multi-venue conferences. It eliminates the need for complex CMS backends by utilizing Google Sheets as the database and a static frontend for display.

### 2. Target Audience
* **Conference Attendees:** Need a mobile-friendly, quick way to view schedules, read abstracts, and plan their day.
* **Event Organizers:** Need a simple way to update schedule changes instantly without coding knowledge (via spreadsheets).
* **Developers:** Need a lightweight codebase that can be skinned and redeployed for future events.

### 3. Functional Requirements

#### 3.1. Data Ingestion (Backend)
* **Source:** The system must pull data from a publicly published Google Sheet (CSV format).
* **Parsing:** A script (`program-update.php`) must parse the flat CSV rows into a hierarchical JSON structure:
    * `Day` -> `Venue/Time Slot` -> `Sessions`.
* **Validation:** The parser must handle empty rows and ensure essential fields (ID, Time, Day) are present.
* **Output:** Generate a `program.json` file on the server to reduce latency for frontend users.

#### 3.2. User Interface (Frontend)
* **Day Navigation:**
    * Tabs must be auto-generated based on the distinct "Day" values found in the JSON.
    * Includes special tabs for "Highlights" and "Favorites".
* **Program Display:**
    * **Venues:** Group sessions by Venue/Time block.
    * **Concurrent Sessions:** If a venue has multiple parallel tracks/presentations, they must display horizontally within the venue block.
    * **Sizing:** Session cards should be sized according to `Session Duration` (percentage width) to visually represent relative duration or importance.
* **Session Details (Modal):**
    * Clicking "Ler mais" (Read more) opens a modal overlay.
    * Modal must display: Title, Authors, Affiliation, Abstract, References, Keywords, and Bios.
    * Modal must be closable via 'X' button, Escape key, or clicking the backdrop.

#### 3.3. Personalization (Favorites)
* **Starring:** Users can toggle a "Star" (☆) icon on any session.
* **Storage:** Favorites are persisted using the browser's `localStorage`.
* **Filtering:**
    * A dedicated "Os meus favoritos" (My Favorites) tab.
    * This tab displays *only* the venues containing favorited sessions.
    * **Empty State:** If no favorites exist, display a randomized, humorous/encouraging message to prompt user interaction.

#### 3.4. Highlights Feature
* A dedicated tab to show sessions marked as `Highlight: 1` in the dataset (e.g., Keynotes, Opening Ceremonies).

### 4. Technical Requirements
* **Performance:** The frontend must load `program.json` asynchronously (Fetch API).
* **Compatibility:** Must work on modern browsers (Chrome, Firefox, Safari, Edge) and be responsive for mobile/tablet/desktop.
* **Dependencies:** No heavy frameworks (React/Vue/Angular) to ensure easy deployment on shared hosting. Vanilla JS only.
* **Resilience:** If `program.json` fails to load, display a user-friendly error message.

### 5. Data Model (CSV Columns)
The system relies on specific column mapping:
* `Day`: Grouping key for tabs (e.g., "19", "20").
* `Venue Date/Hour/Duration`: Sorting and display logic.
* `Venue Title/Location`: Grouping key for the block.
* `ID`: Unique identifier for Favorites logic.
* `Session Duration`: Integer (percentage) for flexbox sizing (e.g., "50" for 50% width).

### 6. Future Roadmap (Out of Scope for v1)
* Search/Filter functionality (by author or keyword).
* Offline mode (Service Workers/PWA).
* Automatic time-zone conversion for virtual attendees.
