import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Auth } from "./components/Auth";
import { Game } from "./components/Game";
import { Leaderboard } from "./components/Leaderboard";

type GameState = "menu" | "playing" | "gameover";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [gameState, setGameState] = useState<GameState>("menu");
  const [lastScore, setLastScore] = useState({ score: 0, logs: 0, combo: 0 });
  const saveScore = useMutation(api.scores.saveScore);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4">🪓</div>
          <div className="text-amber-400 font-bold animate-pulse">Sharpening axes...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const handleGameEnd = async (score: number, logs: number, combo: number) => {
    setLastScore({ score, logs, combo });
    setGameState("gameover");
    try {
      await saveScore({ score, logsSliced: logs, maxCombo: combo });
    } catch (e) {
      console.error("Failed to save score:", e);
    }
  };

  const startGame = () => {
    setGameState("playing");
  };

  const goToMenu = () => {
    setGameState("menu");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black overflow-x-hidden">
      {/* Ambient decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-700/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-amber-800/30 bg-amber-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-2xl md:text-4xl">🪓</span>
          <div>
            <h1 className="font-black text-lg md:text-2xl text-amber-400 leading-tight tracking-tight">LUMBERJACK</h1>
            <h2 className="font-black text-xs md:text-sm text-red-500 tracking-widest">NINJA</h2>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-amber-800/50 hover:bg-amber-700/50 text-amber-300 text-sm font-medium rounded-lg transition-colors border border-amber-700/50"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {gameState === "menu" && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12">
              <div className="text-7xl md:text-9xl mb-4 animate-bounce drop-shadow-2xl">🪓</div>
              <h2 className="font-black text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 mb-2">
                LUMBERJACK
              </h2>
              <h3 className="font-black text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-red-600 to-red-800 tracking-wider mb-6">
                NINJA
              </h3>
              <p className="text-amber-500/80 max-w-md mb-8 text-sm md:text-base leading-relaxed">
                Swipe your way through an endless barrage of flying logs! Slice wood to score points, build combos for bonus scores, but watch out for deadly bombs!
              </p>

              <button
                onClick={startGame}
                className="group relative px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-amber-950 font-black text-xl md:text-2xl rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-amber-900/50"
              >
                <span className="relative z-10 flex items-center gap-3">
                  START CHOPPING
                  <span className="text-2xl md:text-3xl group-hover:animate-bounce">🌲</span>
                </span>
              </button>

              <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-amber-500/70 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪵</span>
                  <span>Slice logs = 10pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span>Golden = 50pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">☠️</span>
                  <span>Bombs = AVOID!</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="lg:w-80 xl:w-96">
              <Leaderboard />
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="flex flex-col items-center">
            <Game onGameEnd={handleGameEnd} />
          </div>
        )}

        {gameState === "gameover" && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 flex flex-col items-center text-center py-8">
              <div className="text-6xl md:text-8xl mb-4">💀</div>
              <h2 className="font-black text-4xl md:text-5xl text-red-500 mb-4">TIMBER!</h2>
              <p className="text-amber-400/80 mb-6">Your logging adventure has ended...</p>

              <div className="bg-amber-900/40 rounded-xl p-6 md:p-8 border-2 border-amber-700/50 mb-8 w-full max-w-sm">
                <div className="text-amber-200 font-black text-5xl md:text-6xl mb-2">{lastScore.score}</div>
                <div className="text-amber-500 font-medium text-lg mb-4">FINAL SCORE</div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-amber-300 font-bold text-2xl">{lastScore.logs}</div>
                    <div className="text-amber-600 text-sm">Logs Sliced</div>
                  </div>
                  <div>
                    <div className="text-amber-300 font-bold text-2xl">{lastScore.combo}x</div>
                    <div className="text-amber-600 text-sm">Max Combo</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-950 font-black text-lg rounded-lg transition-all transform hover:scale-105"
                >
                  PLAY AGAIN 🪓
                </button>
                <button
                  onClick={goToMenu}
                  className="px-8 py-3 bg-amber-800/50 hover:bg-amber-700/50 text-amber-300 font-bold text-lg rounded-lg transition-all border border-amber-700/50"
                >
                  MAIN MENU
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="w-full lg:w-80 xl:w-96">
              <Leaderboard />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-4 text-center text-amber-700/40 text-xs border-t border-amber-800/20">
        Requested by @plantingtoearn · Built by @clonkbot
      </footer>
    </div>
  );
}

export default App;
