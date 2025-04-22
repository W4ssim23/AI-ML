import { game_const } from "../lib/game";

export default function Cell({ value, col, isWinning, handleColumnClick }) {
  const { RED_Player } = game_const;
  const bgClass = isWinning ? "bg-green-200" : "bg-blue-100";

  return (
    <div
      className={`w-14 h-14 border border-blue-500 ${bgClass} flex items-center justify-center rounded-md`}
      onClick={() => handleColumnClick(col)}
    >
      {value && (
        <div
          className={`w-10 h-10 rounded-full ${
            value === RED_Player ? "bg-red-500" : "bg-yellow-500"
          } shadow-md`}
        />
      )}
    </div>
  );
}
