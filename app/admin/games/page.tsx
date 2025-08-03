import Link from "next/link";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function AdminGamesPage() {
  const games = await prisma.game.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Games</h1>
        <Link
          href="/admin/games/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Game
        </Link>
      </div>
      <div className="bg-white rounded shadow divide-y">
        {games.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No games found.</div>
        ) : (
          games.map((game: any) => (
            <div key={game.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-semibold text-lg">{game.title}</div>
                <div className="text-gray-600 text-sm mb-1">{game.category} | {game.isMultiplayer ? "Multiplayer" : "Singleplayer"}</div>
                <div className="text-gray-500 text-xs">{game.description}</div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <a
                  href={game.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Play
                </a>
                {/* Future: Edit/Delete buttons */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}