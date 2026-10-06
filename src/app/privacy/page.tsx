export const metadata = { title: "Privacy policy — CineList" };

export default function Privacy() {
  const h = "mt-8 text-xl font-bold";
  return (
    <div className="mx-auto max-w-2xl text-zinc-300">
      <h1 className="text-3xl font-extrabold text-white">Privacy policy</h1>
      <p className="mt-2 text-sm text-zinc-500">CineList is a personal, non-commercial movie diary project.</p>

      <h2 className={h}>What we store</h2>
      <p className="mt-2 leading-relaxed">
        Your name, email address and username. If you sign up with email, your password is stored only as a secure
        hash. If you sign in with Google, we receive only your name and email address from Google.
      </p>

      <h2 className={h}>What you create</h2>
      <p className="mt-2 leading-relaxed">
        Ratings, comments (visible to other users on movie pages), private notes (visible only to you), your
        watchlist, favorites and saved folders (visible to your friends according to your privacy settings), your
        friend connections, and messages you exchange with friends.
      </p>

      <h2 className={h}>Services we use</h2>
      <p className="mt-2 leading-relaxed">
        Movie data comes from TMDB. Sign-in is provided by Google. The app is hosted with Vercel, Neon and Render.
        We do not sell your data or show ads.
      </p>

      <h2 className={h}>Cookies</h2>
      <p className="mt-2 leading-relaxed">Only the session cookie needed to keep you logged in.</p>

      <h2 className={h}>Deleting your data</h2>
      <p className="mt-2 leading-relaxed">
        To have your account and all its data deleted, email <b>abdusamadsherkulov@gmail.com</b>.
      </p>
    </div>
  );
}