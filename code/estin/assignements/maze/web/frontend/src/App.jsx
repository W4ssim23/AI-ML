import Controls from "./components/Controls";
import MazeDisplay from "./components/MazeDisplay";

function App() {
  return (
    <div className=" w-full h-[100%] min-h-screen bg-gray-800 flex flex-col items-center p-3 overflow-hidden">
      <h1 className="text-4xl font-bold text-white mb-3">The Cheese Maze 🧀</h1>
      <div className="w-[80%] h-[100%] min-h-[85vh] bg-white rounded-xl flex items-start overflow-hidden">
        <Controls />
        <MazeDisplay />
      </div>
      <a
        href="https://github.com/W4ssim23"
        className="w-full text-end text-white px-8 pt-1"
      >
        Made by : Ouassim Zouitene
      </a>
    </div>
  );
}

export default App;
