# Unmute — Product Requirements (v1)

_Last updated: 2026-02 (initial build)_

## Problem Statement (verbatim)
Anonymous student-to-teacher communication platform. Students ask without revealing identity; teachers answer safely. Must feel premium — glassmorphism + neumorphism, soft gradients (purple/blue), dark-mode default, mobile-first, Gen-Z friendly. Mix of Instagram (clean UI) + Reddit (discussion) + Notion (minimal) + Discord (real-time).

## User Personas
- **Student (anonymous)** — high-schooler/college student who avoids asking in class. Needs: psychological safety, speed, clarity, AI help, to see peers share the doubt.
- **Teacher** — subject expert. Needs: prioritized inbox by upvotes, one-click reply, visibility into common struggles, no identity exposure.

## Architecture
- **Frontend:** React 19 + Tailwind + Framer Motion + lucide-react. JWT Bearer stored in `localStorage('unmute_token')`. Axios interceptor attaches header.
- **Backend:** FastAPI + Motor (MongoDB). Bcrypt passwords, PyJWT HS256 tokens (7-day expiry).
- **AI:** GPT-5.2 via Emergent Universal Key (`emergentintegrations.LlmChat`). Uses: rewrite, auto-answer, moderation, similar-question search via keyword regex.
- **Collections:** `users`, `questions`, `answers`.

## What's Implemented (v1 — 2026-02)
- JWT auth: register/login/logout/me; role-guarded endpoints (student vs teacher).
- Anonymous pseudonymous handles for students (e.g., "Curious Fox #1042").
- Seeded 3 teachers (Math/Phys, CS, Bio/Chem) + 1 demo student.
- Questions: ask with subject + tags, smart-route to teacher by subject, upvote toggle, flag, public feed (sort: recent/popular, filter: answered/open/all/subject).
- Teacher inbox with priority sort, inline reply, heatmap of subject doubts, routing tied to teacher's subjects.
- Student dashboard ("Mine") with stats tiles (asked, answered, upvotes).
- AI endpoints: `/ai/rewrite`, `/ai/auto-answer`, `/ai/similar` (keyword-based lookup).
- Moderation runs on submit (AI flags abuse/spam/irrelevant).
- Gamification: `first_question`, `curious_mind`, `top_contributor`, `streak_starter`.
- UI: glassmorphism-heavy dark theme, Outfit + Plus Jakarta Sans, ambient orbs, grain, framer-motion animations (page transitions, upvote pop, layout animation).
- 28/28 backend pytests pass; frontend flows validated end-to-end.

## Prioritized Backlog
### P0 — reliability / polish
- None blocking.

### P1 — features
- Real-time anonymous chat with teacher (Socket.io) — placeholder not yet built.
- Voice-to-text anonymous questions (OpenAI Whisper).
- Poll-based questions ("Does anyone else have this doubt?").
- Notifications center + unread indicator on nav.
- Password reset flow.

### P2 — nice-to-have
- Classroom-specific channels / join-code.
- Scheduled doubt sessions (calendar).
- Replace native `<select>` in feed subject filter with shadcn `Select` for visual polish.
- Clean up `suggest()` helper in `TeacherInbox.ReplyBox` (currently unused).
- Flip `get_current_user` to prefer Bearer over cookie when both present.

## Seed Credentials
See `/app/memory/test_credentials.md`.
