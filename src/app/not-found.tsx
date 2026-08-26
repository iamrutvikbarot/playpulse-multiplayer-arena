import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080A12] text-zinc-100 p-4">
      <h1 className="text-6xl font-black text-purple-400 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-zinc-400 mb-6">The arena room or page you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
      >
        Return to Arena Lobby
      </Link>
    </div>
  );
}
