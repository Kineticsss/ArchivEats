# ArchivEats

---

The place to go to when looking to know about food.

---

**Stack:** React, TypeScript, Vite, Tailwind CSS, Firebase (Auth + Firestore)

---

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Firebase web app config
   and the UID of the account that should be allowed to edit recipes.
3. Publish Firestore security rules so recipes are public to read and
   owner-only to write, and logs are private per user.
4. `npm run dev`

---
