# CineList

A social movie diary: browse movies (via TMDB), rate them 1–10, favorite them, keep a watchlist, save them into folders, comment on movie pages, keep private notes, add friends and chat with them. It does not stream or play movies.

**Stack:** Next.js 15 (App Router, server actions) · TypeScript · Tailwind · Prisma · Postgres · Auth.js (NextAuth v4: Google + email/password) · Socket.IO (separate server)

## Setup
1. Create `.env` (never commit it):
   - `DATABASE_URL` – Postgres URL (e.g. neon.tech)
   - `NEXTAUTH_SECRET` – `openssl rand -base64 32`
   - `NEXTAUTH_URL` – your site URL
   - `TMDB_API_KEY` – from themoviedb.org/settings/api
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` – Google OAuth credentials
   - `SOCKET_SECRET` – shared secret with the socket server (must match on both)
   - `SOCKET_URL` – socket server URL, used server-side to push events
   - `NEXT_PUBLIC_SOCKET_URL` – socket server URL, used by the browser
2. `npm install`
3. `npx prisma db push`
4. `npm run dev` → http://localhost:3000

## Deploy (Vercel)
Push to GitHub, import in Vercel, add the same env vars, deploy. The socket server is deployed separately.

## Structure
- `prisma/schema.prisma` – User, Rating, Comment, Note, Folder, SavedMovie, Favorite, Watchlist, FavoriteActor, Friendship, Message
- `src/app/actions.ts` – all mutations (server actions, always scoped to the logged-in user, with rate limits)
- `src/middleware.ts` – login protection for private pages
- `src/lib/tmdb.ts` – TMDB client (key stays server-side)
- `src/lib/social.ts` – friends, chat threads, friend picks
- `src/lib/realtime.ts` / `src/lib/socket.ts` – server push to the socket server / browser socket client
- `src/app/movie/[id]` – movie page · `src/app/library` – your library · `src/app/u/[id]` – friend profiles
- `src/app/friends`, `src/app/messages` – friends and chat