# WhatsApp Chat Viewer

## Project Description
Project Overview
Build "WA Export Viewer", a client-side web application designed to parse and display exported WhatsApp chat files (.zip). This application acts as an offline viewer that accurately replicates the WhatsApp UI/UX, allowing users to comfortably read back their personal and group chat histories.

Tech Stack & Architecture

Framework: Next.js (App Router). Strictly prioritize Client Components ("use client") since file processing must be done entirely in the browser. For privacy reasons, no user data or chat files should be uploaded to a server.

Styling: Tailwind CSS (must include CSS variable support for seamless Dark/Light mode switching).

Utilities: jszip for client-side .zip extraction, and a custom text parsing utility to break down WhatsApp's .txt timestamp formats into structured JSON objects.

State & Storage: Zustand for global application state management (e.g., active chat selection) and IndexedDB (or LocalStorage) to persist imported chat histories so data is not lost upon page reload.

Core Data Entities (Logical Structure)

ChatSession: Stores chat metadata (ID, Contact/Group Name, chat type, and an array of messages).

Message: Stores individual message details (ID, sender, timestamp, text content, and a boolean flag indicating if it's a system notification or a standard chat message).

Attachment (Optional/Future Proofing): Stores Blob URL references for images or media extracted from the .zip.

Key Features & User Flow

Dashboard/Empty State: An initial landing screen featuring a prominent "Upload WhatsApp Export (.zip)" dropzone or button.

Zip Parsing Engine: A core utility to extract the uploaded .zip, locate the _chat.txt file, and parse the text lines using Regular Expressions (Regex). It must accurately separate the timestamp, sender name, and message body.

Multi-Chat Management: A left sidebar (mirroring WhatsApp Web) that displays a list of all imported chat sessions. Users can import multiple .zip files, switch between different chats, and view the latest message snippet.

Authentic Chat UI: The main reading area displaying message bubbles. Messages from the main user should appear on the right (green bubbles), while messages from others appear on the left (white/dark gray bubbles). It must support group chat views by assigning distinct name colors to different group members.

Data Management: A feature allowing users to permanently delete specific chat sessions from their local storage/IndexedDB.

UI/UX Vibe

Visually, the application must be a pixel-perfect clone of the modern WhatsApp Web interface.

Must robustly support both Dark Mode and Light Mode, reacting dynamically to the user's system preferences with a manual toggle option.

Ensure smooth transitions, clean typography, and a fully responsive layout with a collapsible sidebar for smaller screens.

## Product Requirements Document
Product Requirements Document (PRD): WhatsApp Chat Viewer (WA Export Viewer)

1. Introduction

1.1 Project Goal
To develop a client-side, offline web application named "WA Export Viewer" that accurately parses and displays exported WhatsApp chat files (.zip). The primary objective is to provide a familiar, high-fidelity user experience mirroring the modern WhatsApp Web interface for comfortable review of archived chat histories.

1.2 Scope
This document defines the requirements for Version 1.0 of the WA Export Viewer. The core focus is on reliable file parsing, accurate UI replication, and secure, private client-side data persistence.

1.3 Success Metrics

1. Successful parsing and display of chat history from standard Android and iOS export formats.

2. Consistent 60fps scrolling performance on chats exceeding 50,000 messages, achieved via virtualization.

3. Accurate rendering of Dark Mode and Light Mode themes based on system preferences or user toggle.

4. Zero transmission of user data or uploaded files to any external server.

2. Functional Requirements

2.1 File Ingestion and Parsing (FR-P)

FR-P.1: The application must provide a drag-and-drop or click-to-select interface for uploading a single WhatsApp exported .zip file.

FR-P.2: Upon upload, the application must use jszip to extract the contents entirely within the browser.

FR-P.3: The parser must locate the relevant \"_chat.txt\" file(s) within the extracted directory structure.

FR-P.4: The custom text parsing utility must support flexible Regular Expressions to handle common variations between Android (DD/MM/YY, HH:MM) and iOS (\\d{1,2}/\\d{1,2}/\\d{2,4}, HH:MM:SS) timestamp formats.

FR-P.5: The parser must accurately identify the sender and the message body, correctly handling multi-line messages that share the same preceding timestamp/sender.

FR-P.6: System messages (e.g., \"This message was deleted,\" contact changes) must be identified and rendered appropriately as non-bubble notifications.

FR-P.7: All parsed data must be converted into the defined Message entity structure and stored in IndexedDB.

2.2 Data Persistence and Management (FR-DM)

FR-DM.1: All imported chat histories must be persisted using IndexedDB to accommodate large file sizes (up to 100MB+ of textual data). LocalStorage is strictly prohibited for chat history storage.

FR-DM.2: The application must support the import of multiple distinct chat exports (multiple .zip files).

FR-DM.3: Users must have a mechanism to browse all imported ChatSessions via the sidebar.

FR-DM.4: A clear action must be available to permanently delete a specific ChatSession from IndexedDB.

2.3 Chat Viewing Interface (FR-CV)

FR-CV.1: The main view must faithfully replicate the look and feel of the modern WhatsApp Web messaging pane.

FR-CV.2: Message bubbles must align correctly: sender messages (user) on the right (green); receiver messages on the left (white/dark gray).

FR-CV.3: In group chats, each unique sender must be assigned a distinct, recognizable color for their name header above their message bubble.

FR-CV.4: The application must utilize virtualization/windowing (e.g., using \\@tanstack/react-virtual) to render the message list, ensuring 60fps scrolling performance for chats exceeding 50,000 entries.

FR-CV.5: Switching between loaded chats from the sidebar must initiate a subtle skeleton loading indicator if the display of the first visible window takes longer than 100ms to render from IndexedDB.

2.4 Media Handling (FR-M) (V1 Goal with Security Focus)

FR-M.1: The viewer must attempt to locate media files referenced within the exported structure inside the same extracted .zip folder.

FR-M.2: Extracted media must be converted into temporary in-memory Blob URLs for display within the browser context only.

FR-M.3: The application must strictly allowlist only standard media extensions: \\.jpg, \\.jpeg, \\.png, \\.webp, \\.mp4, \\.opus, \\.ogg. Any other file type encountered must be ignored or flagged as 'Media omitted'.

FR-M.4: If a referenced media file is not found in the zip, a generic \"Media omitted\" placeholder must be displayed.

3. Non-Functional Requirements

3.1 Performance (NFR-P)

NFR-P.1: Initial load time for the web application (from navigation to dashboard) must be under 1.5 seconds on modern hardware.

NFR-P.2: The initial rendering of the top viewport for a large chat (50,000+ messages) must complete in under 2 seconds.

NFR-P.3: Scrolling performance must be maintained at 60 frames per second (FPS) regardless of the number of messages rendered within the viewport.

3.2 Security and Privacy (NFR-S)

NFR-S.1: Data processing (parsing, reading, viewing) must occur exclusively on the client side. No file upload or streaming to a backend server is permitted.

NFR-S.2: All imported data must remain confined to the user's browser storage (IndexedDB).

NFR-S.3: As defined in FR-M.3, strict sanitization and allowlisting must be applied to any file extracted from the uploaded zip archive.

3.3 Architecture and Technology (NFR-A)

NFR-A.1: The application must be built using Next.js leveraging the App Router structure.

NFR-A.2: Strict adherence to Client Components (\\\"use client\\\") is mandatory for all components involving file interaction, state management, and DOM manipulation.

NFR-A.3: State management must utilize Zustand for global state orchestration (e.g., active chat, theme setting).

3.4 UI/UX and Theming (NFR-U)

NFR-U.1: The design must be a pixel-perfect replica of the contemporary WhatsApp Web aesthetic.

NFR-U.2: The application must support dynamic Dark Mode/Light Mode switching, defaulting to the user's operating system preference. A manual toggle must be available in the settings/header.

NFR-U.3: Theming must be implemented using Tailwind CSS, leveraging CSS variables for efficient color switching between modes.

NFR-U.4: **Color Palette (Dark Mode):** Background: \\#111b21, Header/Sidebar: \\#202c33, Right Bubble: \\#005c4b, Left Bubble: \\#202c33.

NFR-U.5: **Color Palette (Light Mode):** Background: \\#efeae2, Header/Sidebar: \\#f0f2f5, Right Bubble: \\#d9fdd3, Left Bubble: \\#ffffff.

NFR-U.6: **Responsiveness:** On screens smaller than 768px, the chat list sidebar must become a full-screen modal view, accessible via a 'Back' button in the chat header to return to the list. On desktop, the sidebar must be persistent on the left.

NFR-U.7: Typography should favor clean, standard system fonts (e.g., Segoe UI, Helvetica Neue).

4. Data Models (Logical Structure)

4.1 ChatSession Entity

- sessionId (String/UUID)

- contactName (String)

- isGroup (Boolean)

- lastMessageSnippet (String) (Derived from latest message)

- importedTimestamp (Date)

- messages (Array of Message)

4.2 Message Entity

- messageId (String/UUID)

- sender (String)

- rawTimestamp (String) (Original parsed timestamp string)

- formattedTimestamp (Date/ISOString)

- content (String)

- isSystemMessage (Boolean)

- mediaReference (String, optional - Link to IndexedDB Blob store or null)

5. Future Considerations (Out of Scope for V1)


1. Full-text search functionality across all indexed chats.

2. Calendar view integration to jump to specific dates.

3. Export functionality to non-proprietary formats (e.g., JSON, CSV).

4. PWA installation prompt configuration for full offline capability.

## Technology Stack
# TECH STACK: WhatsApp Chat Viewer (WA Export Viewer)

## 1. Core Application Framework

**Technology:** Next.js (App Router)
**Justification:** Next.js provides an excellent foundation for a performant, modern React application. Crucially, the architecture strictly enforces client-side processing via the explicit use of Client Components (`\"use client\"`) throughout the application. This ensures that sensitive user data (exported .zip files and parsed chat content) never leaves the user's browser, fulfilling the core privacy requirement. Deployment as a static site (SSG) via Vercel is straightforward for this client-only application.

## 2. Rendering and UI Management

**Technology:** React (with Virtualization Library)
**Justification:** Due to the performance requirement of handling potentially 50,000+ message DOM nodes, standard rendering is unacceptable.
*   **Virtualization:** Implementation of a library such as `@tanstack/react-virtual` or `react-window` is mandatory to ensure 60fps scrolling performance by rendering only the visible message subset (windowing).

**Technology:** Tailwind CSS
**Justification:** Provides utility-first styling necessary for rapidly achieving the pixel-perfect replication of the WhatsApp Web UI/UX. Its architecture easily supports theming using CSS variables, which is essential for the dynamic Dark/Light mode switching based on user preference and system settings.

**Technology:** CSS Variables for Theming
**Justification:** Required to implement the precise color palette specified (e.g., `#111b21` for Dark Mode background) and allow for dynamic switching between Light and Dark modes without requiring large stylesheet reloads.

## 3. Data Processing and Parsing Utilities

**Technology:** jszip
**Justification:** Essential library for asynchronously handling binary file input in the browser. It is necessary for extracting the contents of the user-uploaded `.zip` archive without server interaction.

**Technology:** Custom JavaScript/TypeScript Parsing Utility (utilizing Regular Expressions - Regex)
**Justification:** WhatsApp export formats (Android vs. iOS) are highly variable and require complex pattern matching. A custom utility is needed to robustly detect line beginnings based on date/time stamps (e.g., `DD/MM/YY, HH:MM - ` or `[DD/MM/YY, HH:MM:SS] `), correctly associate multi-line messages to the preceding sender, and flag deleted messages. Strict UTF-8 handling is assumed for text extraction.

**Technology:** Blob URLs / URL.createObjectURL()
**Justification:** Required for handling attachment files extracted by jszip. Media files (images, videos) will be converted into temporary, in-memory Blob URLs to be displayed within the virtualized chat view without needing to be saved permanently or uploaded. Strict MIME-type allowlisting will be enforced here for security.

## 4. State Management and Persistence

**Technology:** Zustand
**Justification:** A lightweight, non-boilerplate state manager ideal for handling global client state such as the currently active chat ID, theme selection, and the state of the loading/parsing process. Its simplicity integrates well with React and Next.js Client Components.

**Technology:** IndexedDB (Primary) / LocalStorage (Fallback/Small Data)
**Justification:** **IndexedDB is the mandatory primary storage solution.** LocalStorage's strict size limit (~5MB) is insufficient for multi-year chat archives. IndexedDB offers asynchronous, transactional storage necessary to persist large structured JSON representations of the chat history, ensuring data remains available across user sessions without re-parsing.

## 5. Architecture and Security Considerations

**Architectural Constraint:** Client-Side Only Execution
**Justification:** The primary architectural decision is the strict avoidance of a backend server for data processing. This guarantees maximum user privacy by ensuring that no chat content or metadata ever leaves the client environment.

**Deployment Strategy:** Static Hosting (Vercel/Netlify) + PWA Future State
**Justification:** Deployment as a fully static site maximizes performance and minimizes operational overhead, aligning with the client-only processing model. Future conversion to a Progressive Web App (PWA) will provide true offline accessibility and local installation convenience.

## Project Structure
# PROJECT STRUCTURE DOCUMENT: WA Export Viewer

## 1. Overview

This document details the file and directory organization for the WA Export Viewer project, built using Next.js (App Router). The structure emphasizes modularity, clear separation of client-side concerns (as everything is client-side), and dedicated folders for utilities, components, and data persistence logic.

## 2. Root Level Structure

```
/wa-export-viewer
├── .next/                  # Next.js build output (ignored by Git)
├── node_modules/           # Project dependencies
├── public/                 # Static assets (icons, logos)
├── src/                    # Primary application source code directory
├── .env.local              # Environment variables (e.g., for future configuration)
├── next.config.js          # Next.js configuration
├── package.json            # Project metadata and scripts
├── postcss.config.js       # PostCSS configuration (for Tailwind)
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 3. The `src/` Directory Structure

The core logic resides within the `src` directory, structured around the Next.js App Router convention and functional grouping.

```
/src
├── app/                    # Next.js App Router (Routing & Layouts)
│   ├── (app)/              # Grouping for the main authenticated/loaded application view
│   │   ├── chat/[chatId]/page.tsx  # Dynamic route for viewing a specific chat session
│   │   ├── layout.tsx              # Main application layout (Sidebar + Chat Area)
│   │   └── page.tsx                # Dashboard / Upload landing page
│   ├── api/                # (Empty/Reserved for future SSG/PWA metadata)
│   ├── globals.css         # Global styles (imports Tailwind base styles)
│   └── layout.tsx          # Root layout (HTML structure, providers, theme wrapper)
│
├── components/             # Reusable UI components (Small, focused, mostly Client Components)
│   ├── ui/                 # Generic, themeable UI primitives (Buttons, Inputs, Icons)
│   │   ├── Button.tsx
│   │   ├── Icon.tsx
│   │   └── Dropzone.tsx
│   │
│   ├── chat/               # Components specific to the Chat View
│   │   ├── ChatBubble.tsx          # Renders an individual message
│   │   ├── ChatHeader.tsx          # Display sender/group name
│   │   └── VirtualizedChatWindow.tsx # Handles message rendering with virtualization
│   │
│   └── layout/             # Components related to structure (Sidebar, Nav)
│       ├── Sidebar.tsx             # Renders the list of imported chats
│       └── ThemeToggle.tsx         # Component for switching Dark/Light mode
│
├── lib/                    # Core application logic, utilities, and services
│   ├── db/                 # Data persistence handlers (IndexedDB abstraction)
│   │   ├── indexedDbService.ts     # Core IndexedDB read/write operations
│   │   └── storageKeys.ts          # Constants for IndexedDB object stores
│   │
│   ├── parsing/            # Utilities dedicated to WhatsApp .txt parsing
│   │   ├── chatParser.ts           # Main function to handle .txt -> JSON conversion
│   │   └── regexPatterns.ts        # Collection of flexible Regex patterns for date/sender extraction
│   │
│   ├── providers/          # Context/Provider definitions (If not using Zustand directly in state/)
│   └── utils/              # General non-parsing, non-DB utilities
│       ├── zipHandler.ts           # Logic using jszip for file extraction
│       └── themeUtils.ts           # Logic for reading/setting theme preference (CSS variables)
│
├── hooks/                  # Custom React hooks
│   ├── useChatNavigation.ts        # Logic for mobile sidebar transition / state selection
│   └── useTheme.ts                 # Hook for observing system theme changes
│
├── state/                  # Global state management using Zustand stores
│   ├── chatStore.ts                # Manages the list of loaded ChatSessions and active selection
│   └── uiStore.ts                  # Manages UI state (e.g., sidebar visibility on mobile)
│
├── types/                  # TypeScript definitions and interfaces
│   ├── chat.d.ts           # Defines ChatSession, Message, Attachment interfaces
│   └── index.d.ts
│
└── appStyles/              # Specific CSS/variables needed outside of Tailwind utility class application
    └── whatsappTheme.css   # Defines the base CSS variables for Dark/Light mode (#111b21, #efeae2 etc.)
```

## 4. Key Directory Explanations

### `app/(app)/`
This directory group encapsulates the main user interface once a chat is loaded or ready to be loaded. All components here are strictly marked `"use client"`.

### `components/chat/VirtualizedChatWindow.tsx`
This component is critical. It will utilize a virtualization library (e.g., `@tanstack/react-virtual`) to manage rendering only the visible messages, ensuring 60fps scrolling performance even with extremely large chat datasets loaded from IndexedDB.

### `lib/db/indexedDbService.ts`
This service layer abstracts away the complexity of dealing directly with the IndexedDB API. It handles asynchronous operations for loading, saving, and deleting entire chat histories, crucial for handling large data payloads reliably.

### `lib/parsing/chatParser.ts`
This file contains the primary business logic for transforming the raw string output of WhatsApp exports into the structured `Message` objects defined in `types/chat.d.ts`. It must implement the robust Regex logic to handle varied date formats (Android vs. iOS) and multi-line messages where the date signature only appears at the start of the block.

### `state/chatStore.ts`
This Zustand store will hold the primary data model:
1. An array/map of all loaded `ChatSession` objects retrieved from IndexedDB on app load.
2. The ID of the `activeChatId`.
3. Functions to trigger data fetching/saving via `indexedDbService.ts`.

### `public/`
This directory will house assets like:
*   `logo.svg`
*   `whatsapp-placeholder.svg` (For omitted media)
*   Favicons

### `tailwind.config.js`
This configuration file must define custom colors mapped to CSS variables to facilitate the precise color palette cloning required for both Dark and Light modes (e.g., `--bg-primary-dark`, `--bubble-sender-light`).

## Database Schema Design
# SCHEMADESIGN: WhatsApp Chat Viewer (WA Export Viewer)

## 1. Introduction and Rationale

This document outlines the conceptual and practical data structure required for storing parsed WhatsApp chat exports within the client-side application, primarily utilizing **IndexedDB**. Given the strict privacy constraints (zero server interaction) and the necessity to handle potentially large datasets (multi-year chats), an efficient, asynchronous, key-value/object store model is mandated over simpler structures like LocalStorage.

The schema is designed to be normalized for efficient querying and retrieval, specifically catering to the primary use cases: loading a specific chat history and rendering message blocks with virtualization.

## 2. Primary Data Models (Logical Structure)

The system relies on three core entities, translated into IndexedDB object stores:

### 2.1. ChatSession (Metadata Store)

This store holds the high-level index information for all imported chats, allowing for the quick population of the navigation sidebar without loading the full message payload.

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `sessionId` | String (Primary Key) | Unique identifier for the chat session (e.g., derived from the .zip filename or a UUID). | Must be unique. Used as the primary key for indexing messages. |
| `chatName` | String | The display name of the contact or group. | Used directly in the sidebar display. |
| `chatType` | String | \"individual\" or \"group\". | Useful for rendering logic (e.g., name coloring in groups). |
| `lastMessageSnippet` | String | The text content of the most recent message. | Used for the preview text in the sidebar list. |
| `lastActivityTimestamp` | Number (Unix MS) | Timestamp of the latest message in the session. | Used for sorting the sidebar chronologically. |
| `importDate` | Number (Unix MS) | When the session was imported into the viewer. | For internal data management/cleanup. |
| `isRead` | Boolean | Status flag (if read receipts were tracked). | Future proofing. Default: true (always viewed). |

### 2.2. Message (Content Store)

This is the primary data store containing the parsed conversation threads. To ensure fast retrieval for large chats, this store will be associated with the `sessionId` key.

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `messageId` | String | Unique identifier for the message (often derived from its sequence number or the timestamp/sender combination). | Primary key within the Message store, or a composite key depending on implementation. |
| `sessionId` | String (Index) | Foreign key linking back to the `ChatSession`. | Crucial for targeted querying of one chat history. |
| `timestamp` | Number (Unix MS) | Parsed, standardized Unix timestamp of the message origin. | Primary sorting mechanism for rendering. |
| `sender` | String | The name of the person who sent the message. | Used for determining bubble alignment (Self vs. Other). |
| `rawContent` | String | The raw text body of the message. | Can contain internal formatting markers if preserved. |
| `isSystemMessage` | Boolean | True if the message is a system notification (e.g., \"X left the group,\" \"Message deleted\"). | Defaults to false. |
| `contentType` | String | \"text\", \"media\", \"status\". | Defines how the content section should render. |
| `attachmentRef` | String (Optional) | Reference key if media is stored in the Attachment store (Future). | Null if content is purely text. |

### 2.3. Attachment (Media Reference Store - Future Proofing)

While initial media extraction might use temporary Blob URLs directly in the Message object, a dedicated store is planned for persistent, non-text assets if the user chooses to "pin" or save specific media permanently.

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `attachmentId` | String (Primary Key) | Unique ID for the stored media asset. | |
| `sessionId` | String (Index) | Link to the parent chat session. | |
| `messageId` | String (Index) | Link to the parent message. | |
| `mimeType` | String | Stored MIME type (e.g., image/jpeg). | Used for security validation and rendering. |
| `blobURL` | String | The generated browser Blob URL pointing to the in-memory/IndexedDB data. | Only valid while the application session is active or persisted. |

## 3. IndexedDB Structure & Storage Strategy

The application will utilize an IndexedDB database named `WA_Exports_DB`.

### 3.1. Database Layout

| Object Store Name | Key Path | Index Fields | Purpose |
| :--- | :--- | :--- | :--- |
| `sessions` | `sessionId` | `lastActivityTimestamp` (Descending) | Quick access to chat list metadata. |
| `messages` | `messageId` | `sessionId` (Primary Query Index), `timestamp` (Secondary Sort Index) | Storing the high volume of conversation data. |
| `attachments` | `attachmentId` | `sessionId`, `messageId` | Future media persistence. |

### 3.2. Data Flow and Performance Optimization

1.  **Import/Parsing:** Upon successful `.zip` parsing, data is batched. `ChatSession` records are written to the `sessions` store. The massive `Message` array is written to the `messages` store, ensuring each message record includes the foreign `sessionId`.
2.  **Chat Selection (Sidebar Click):** The application performs a single, fast query against the `messages` object store: `getAll(IDBKeyRange.only(selectedSessionId), { index: 'sessionId' })`.
3.  **Virtualization Rendering:** The resulting array of messages is passed directly to the windowing component (e.g., TanStack Virtual). Because messages are already sorted by `timestamp` within the resulting subset, rendering performance is maintained at 60fps by only manipulating the DOM for currently visible rows.

### 3.3. Key Parsing Output Mapping

The custom parser utility must map complex WhatsApp text formats into the defined Message schema structure:

*   **Timestamp Normalization:** All variances (DD/MM/YY vs. MM/DD/YY, 12hr vs. 24hr) must be aggressively converted into a single, standardized **Unix Millisecond Timestamp** (`timestamp` field). This standardization is critical for consistent sorting and timeline representation.
*   **Sender Identification:** Robust logic must be implemented to differentiate the current user (if known from the initial chat metadata) from all other participants, mapping them correctly to the `sender` field.
*   **System Message Detection:** Regex flags for common WhatsApp system phrases (e.g., \"Messages and calls are end-to-end encrypted,\" \"\\[User Name] added \\[-some contact-\\]\") must populate the `isSystemMessage` flag.

## User Flow
# USER FLOW: WhatsApp Chat Viewer (WA Export Viewer)

## 1. Overview and Entry Point

The application begins in an **Empty State Dashboard**.

### 1.1 Initial Load (Empty State)

**Screen:** Full viewport display centered around the primary action.
**Goal:** Prompt the user to upload the required ZIP file.

**Interaction Flow:**
1. User navigates to the application URL.
2. **(Client Component Load)**: Application checks IndexedDB for existing `ChatSession` data.
    * **If Data Exists:** Skip to Section 2.1 (Dashboard with Chats).
    * **If No Data Exists:** Load Empty State UI.
3. **Empty State UI Details:**
    * Prominent, visually appealing drop zone styled like the WhatsApp Web import prompt.
    * Text: \"Welcome to WA Export Viewer. Import your WhatsApp Chat History to begin.\"
    * Primary CTA: \"Browse Files\" or Drag-and-Drop Area.
    * Secondary CTA: Link/Button explaining the privacy guarantees (Client-side processing only).

### 1.2 ZIP File Upload and Validation

**Trigger:** User drops a file into the zone or clicks to select a file via the system dialog.

**Interaction Flow:**
1. **Client-Side Validation:** Check file extension (`.zip`). If invalid, display an inline error: \"Invalid file type. Please upload a .zip archive.\"
2. **Initiate Extraction:** If valid, display a modal or progress bar overlay: \"Extracting and Parsing Chat Data... This may take a moment.\"
3. **JSZip Processing:** Use `jszip` to read the archive contents in the browser memory.
4. **File Identification:** Search the extracted file list for files matching the pattern `*\_chat.txt` (handling both Android and iOS export folder structures, e.g., `/WhatsApp/Databases/msgstore.db.crypt14` equivalent text file, which is typically named `chat.txt` or similar within the export folder structure).
5. **Error Handling (Missing Files):** If the crucial `.txt` file is not found, display an error: \"Could not locate the primary chat log file within the archive. Ensure this is a complete WhatsApp export.\"
6. **Begin Parsing:** If found, pass the raw text content to the custom parsing utility (detailed in Section 3.1).

## 2. Main Application States

Once data processing is complete, the application transitions to the main viewing interface, mirroring the WhatsApp Web layout.

### 2.1 Dashboard with Chats (Persistent Sidebar)

This state is active on desktop/tablet views, and is the initial view upon returning to the app if data exists.

**Layout:** Two-panel view (Sidebar | Chat View).
**Data Source:** `ChatSession` list retrieved from Zustand store, persisted in IndexedDB.

**Interaction Flow (Sidebar - Left Panel):**
1. **Chat List Rendering:** Display a vertically scrollable list of all imported `ChatSession` entries.
2. **List Item Contents (Per Chat):**
    * Contact/Group Avatar placeholder (initials or generic icon).
    * Contact/Group Name (Bold).
    * Snippet of the last message text (Truncated to ~30 chars).
    * Timestamp of the last message.
3. **Sidebar Actions:**
    * **New Chat Icon:** Placeholder for future features (e.g., start a new conversation locally).
    * **Import More Button:** Triggers a file selection dialog to import additional chat archives (merging/adding to existing list).
    * **Data Management:** Icon/Button to access the Data Management view (See Section 4.1).
4. **Active Selection:** One chat item is highlighted, corresponding to the content displayed in the right panel.
5. **Switching Chat:**
    * **Desktop:** Click any item in the list instantly loads the chat content.
    * **Mobile (< 768px):** Tapping an item triggers a navigation transition to the Chat View (See Section 2.2).

### 2.2 Active Chat View (Main Content Panel)

This panel displays the conversation history for the currently selected `ChatSession`.

**Layout:** Message viewport, Header, Input area (placeholder).
**Performance Constraint:** Must utilize virtualized scrolling for message rendering.

**Interaction Flow (Chat View):**
1. **Header Bar:**
    * **Left Side (Mobile):** Back Arrow/Button to return to the Sidebar List (Section 2.1).
    * **Center:** Contact/Group Name.
    * **Right Side:** Search icon, Menu icon (for context-specific settings, e.g., View Media, Info).
2. **Message Rendering (Virtualized List):**
    * Messages are rendered bottom-up (newest message at the bottom).
    * **Bubble Styling:**
        * **Sender (This User):** Right-aligned, distinct background color (Green in Dark Mode, Light Green in Light Mode).
        * **Receiver (Other):** Left-aligned, neutral background (Dark Gray in Dark Mode, White in Light Mode).
    * **Timestamp Display:** Timestamps are embedded within or immediately adjacent to the message bubble, following the original format or a standardized clean format.
    * **System Messages:** Rendered centrally, often with a distinct, muted style (e.g., "This message was deleted.").
    * **Group Chats:** Assign distinct, consistent color coding to each distinct sender name for visual differentiation.
3. **Attachment Handling:** If the message contains recognized media tags (based on parsing success), render a placeholder thumbnail/icon linked to the extracted Blob URL. If media extraction failed or is missing, render a standard \"[Media Omitted]\" block.
4. **Initial Load State:** If switching from one chat to another, display a brief loading indicator (e.g., a subtle skeleton loader in the message area) while messages are retrieved from IndexedDB and initialized for the virtualizer.

## 3. Core Processing Flows (Behind the Scenes)

These flows primarily execute during initial import or when refreshing the application state.

### 3.1 ZIP Parsing and Text Normalization

**Input:** Raw `.txt` content string from the ZIP extraction.
**Output:** Structured array of `Message` objects, grouped into a `ChatSession`.

**Parsing Logic Sequence:**
1. **Line Iteration:** Process the text line by line.
2. **Regex Matching:** Apply flexible Regular Expressions to detect the start of a new message block, matching both Android (`DD/MM/YY, HH:MM - Sender:`) and iOS (`[DD/MM/YY, HH:MM:SS] Sender:`) formats.
3. **Multi-Line Message Handling:** If a line does not match the header regex, it is appended to the content of the *previous* message object until a new valid header line is found.
4. **Data Structuring:** Extract and map:
    * `timestamp` (Normalized ISO string output).
    * `sender` (Trimmed Name).
    * `content` (Text body, cleaned of leading/trailing whitespace).
    * `isSystem` (Boolean flag based on content keywords like "deleted" or "changed privacy settings").
5. **Chat Metadata Extraction:** Determine the contact/group name (often inferred from the filename or requires user confirmation/input during import if ambiguous).
6. **State Update:** Dispatch action to Zustand to save the new `ChatSession` object to IndexedDB.

### 3.2 State Persistence and Retrieval

**Storage Mechanism:** IndexedDB (via a suitable wrapper library).

**Flows:**
1. **On Import Completion:** Write the new `ChatSession` JSON structure into the IndexedDB store designated for chat data.
2. **On Application Startup:** Asynchronously query IndexedDB for all stored `ChatSession` records. Once retrieved, populate the Zustand global state (`chatList` slice).
3. **On Chat Switch:** Retrieve the full message history for the selected `ChatID` from IndexedDB and load it into the active chat state for virtualized rendering.

## 4. Data Management and Settings

Accessible via the sidebar menu.

### 4.1 Deletion Flow

**Goal:** Allow users to permanently remove specific imported chat histories.

**Interaction Flow:**
1. User navigates to Data Management.
2. A list of imported chats is displayed, each with a destructive action button (e.g., a red trash can icon).
3. **Confirmation Prompt:** Clicking delete triggers a modal confirmation: \"Are you sure you want to permanently delete the chat history for [Contact Name]? This action cannot be undone.\"
4. **Execution:** If confirmed, the application performs two steps:
    * Deletes the corresponding `ChatSession` record from IndexedDB.
    * Updates the Zustand store, triggering a re-render of the sidebar (the deleted chat disappears).

### 4.2 Theming and Settings Flow (Future Proofing)

**Goal:** Control UI appearance (Light/Dark Mode).

**Interaction Flow:**
1. Access Settings Panel.
2. **Theme Toggle:** Display a radio button or switch for:
    * System Default (Uses `prefers-color-scheme`).
    * Light Mode.
    * Dark Mode.
3. **Real-time Update:** Changing this setting immediately updates the root HTML class (e.g., adding `dark` class) to trigger the Tailwind CSS variable switching, providing instant visual feedback without a page reload.

## Styling Guidelines
# STYLING GUIDELINES: WA Export Viewer

## 1. Design Philosophy & Principles

The primary design goal is **Pixel-Perfect Replication** of the modern WhatsApp Web user interface (UI) to provide users with maximum familiarity and minimum cognitive load when reviewing historical data.

**Core Principles:**

1.  **Fidelity:** Adherence to WhatsApp Web visual standards for layout, spacing, colors, and typography.
2.  **Responsiveness:** Seamless transition between desktop (persistent sidebar) and mobile (collapsible/transitional sidebar) experiences.
3.  **Accessibility:** Robust and aesthetically pleasing support for both Dark and Light modes via dynamic CSS variables.
4.  **Performance:** Styling must not impede the necessary rendering performance achieved through component virtualization.

## 2. Color Palette

The application must utilize a dynamic color system powered by CSS variables defined within the global stylesheet (Tailwind configuration setup). Colors are sourced directly from observed WhatsApp Web themes.

| Role | Light Mode Value | Dark Mode Value | CSS Variable Name | Tailwind Utility Class Example |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Background** | `#efeae2` | `#111b21` | `--color-bg-primary` | `bg-[--color-bg-primary]` |
| **Sidebar/Header BG** | `#f0f2f5` | `#202c33` | `--color-bg-surface` | `bg-[--color-bg-surface]` |
| **Right Bubble (Sent)** | `#d9fdd3` | `#005c4b` | `--color-bubble-sent` | `bg-[--color-bubble-sent]` |
| **Left Bubble (Received)** | `#ffffff` | `#202c33` | `--color-bubble-received` | `bg-[--color-bubble-received]` |
| **Text Primary** | `#000000` | `#ffffff` | `--color-text-primary` | `text-[--color-text-primary]` |
| **Text Secondary/Meta**| `#667781` | `#8696a0` | `--color-text-secondary` | `text-[--color-text-secondary]` |
| **Group Member Color 1**| *(Varies)* | *(Varies)* | `--color-group-member-1` | `text-[--color-group-member-1]` |
| **Group Member Color 2**| *(Varies)* | *(Varies)* | `--color-group-member-2` | `text-[--color-group-member-2]` |

***Note on Group Member Colors:*** Specific, saturated, yet muted colors must be assigned to group members on first encounter and persisted per session for high-fidelity group chat viewing. These colors should contrast well against the light and dark received bubble backgrounds.

## 3. Typography

Font stack selection must prioritize system fonts for rendering speed and authentic feel, mirroring native OS text rendering.

**Font Family:**
`font-family: -apple-system, BlinkMacSystemFont, \\"Segoe UI\\", Roboto, Helvetica, Arial, sans-serif, \\"Apple Color Emoji\\", \\"Segoe UI Emoji\\", \\"Segoe UI Symbol\\";`

| Element | Font Size (Base) | Weight | Line Height | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Body Text (Message)**| 14px (0.875rem) | Regular (400) | 1.3 | Standard message content. |
| **Metadata (Timestamp)**| 12px (0.75rem) | Regular (400) | 1.4 | Small font for message metadata (time/status). |
| **Sidebar Contact Name**| 16px (1rem) | Semibold (600) | 1.2 | Prominent names in the chat list. |
| **Header Title (Chat)** | 16px (1rem) | Semibold (600) | 1.2 | Current active chat name. |

## 4. Layout and Responsiveness (Tailwind Implementation)

The layout must strictly follow the two-panel structure of WhatsApp Web.

### 4.1. Global Structure

Use a primary Flex or Grid container spanning 100% viewport height (`min-h-screen`).

**Desktop (> 1024px):**
*   **Sidebar:** Fixed width, e.g., `w-[350px]` (to mimic WA Web width).
*   **Chat View:** Takes the remaining space (`flex-1`). Both panels visible simultaneously.

**Tablet (768px to 1023px):**
*   **Sidebar:** Collapsible. Default state can be hidden or minimized.
*   **Chat View:** Full width when active.

**Mobile (< 768px):**
*   **Sidebar:** Full screen overlay/transition when active (e.g., `fixed inset-0 z-30`).
*   **Chat View:** Full screen. Switching chats must trigger a full transition (navigating *into* the chat view, requiring a dedicated "Back" button in the header to return to the sidebar list).

### 4.2. Component Styling Focus

#### A. Sidebar (Chat List)

*   **Container:** Uses `--color-bg-surface`.
*   **Search Bar:** Minimalist, slightly rounded input field, leveraging system focus styles.
*   **Chat Item:** On hover, apply a subtle background color change (e.g., `bg-opacity-50` of the main background, or a specific hover variable if defined). Selected chat must have a distinct, persistent background color (e.g., using the received bubble color or a slightly darker version of the surface color).
*   **Unread Badge:** Circular element, usually green or primary brand color, positioned top-right of the contact name/snippet.

#### B. Chat Header (Top Bar of Chat View)

*   **Container:** Must use `--color-bg-surface`. Fixed position at the top.
*   **Profile/Name:** Left-aligned. Uses the active chat name and profile picture placeholder.
*   **Utility Icons (Search, Menu):** Right-aligned standard SVG icons (e.g., magnifying glass, three dots). Must ensure icons are colored using the `--color-text-secondary` variable.

#### C. Message Bubbles (The Core Component)

This section requires the most precise styling, especially for dynamic positioning and shape.

*   **Container:** Messages must be rendered within a container that uses virtualization/windowing.
*   **Alignment:**
    *   Sent Messages (Self): Aligned to the right (`ml-auto`).
    *   Received Messages (Other): Aligned to the left (`mr-auto`).
*   **Background & Text:**
    *   Sent: `bg-[--color-bubble-sent]`, Text: `text-white`.
    *   Received: `bg-[--color-bubble-received]`, Text: `text-[--color-text-primary]`.
*   **Shape (Borders/Corners):** Use `rounded-lg` utilities with specific adjustment on the corner nearest the speaker to create the characteristic WA tail effect (this usually involves asymmetric border-radius settings).
    *   Sent: Slightly more rounded on the top-left/bottom-left.
    *   Received: Slightly more rounded on the top-right/bottom-right.
*   **Timestamps & Read Receipts:** Rendered beneath the message content, using small text size and `--color-text-secondary`.

#### D. Input Footer (Bottom Area)

*   Fixed at the bottom of the viewport when viewing a chat.
*   Must maintain the same `--color-bg-surface` as the header.
*   The text input field should mimic WhatsApp's slightly expanded, rounded input box design.

## 5. Dark/Light Mode Implementation (Tailwind & CSS Variables)

All base elements must default to the Light Mode values defined in the root HTML element or parent wrapper.

**Implementation Strategy:**

1.  Define CSS variables in the main layout component (e.g., `layout.tsx`) applied conditionally based on the current theme state (managed via Zustand).
    ```css
    :root {
      /* Light Mode Defaults */
      --color-bg-primary: #efeae2;
      --color-bg-surface: #f0f2f5;
      /* ... other variables */
    }
    .dark {
      --color-bg-primary: #111b21;
      --color-bg-surface: #202c33;
      /* ... dark mode overrides */
    }
    ```
2.  Tailwind utilities should primarily reference these variables: `bg-[var(--color-bg-primary)]`, `text-[var(--color-text-primary)]`.
3.  The theme toggle button must update the root element's class list (`className={theme === 'dark' ? 'dark' : 'light'}`).

## 6. Interactive Elements & States

*   **Hover States:** Subtle background shifts on interactive elements (Sidebar items, utility icons).
*   **Active State:** Clear, persistent visual indication for the currently selected chat session in the sidebar (using a specific background color defined by the theme variables).
*   **Virtualization Loader:** When loading content from IndexedDB exceeds acceptable thresholds (e.g., > 100ms), a very subtle, non-intrusive skeleton loader must appear in the main chat area, mimicking the general shape of message bubbles before the full content renders.
