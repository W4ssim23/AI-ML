import React from "react";
import Params from "./Params";
import Buttons from "./Buttons";
import Stats from "./Stats";

export default function Controls() {
  return (
    <div className=" w-[24%] min-h-[85vh] h-[100%] bg-gray-200 flex flex-col items-center p-4 gap-4">
      <h2 className="text-xl font-bold self-start">Controls</h2>
      <Params />
      <Buttons />
      <Stats />
    </div>
  );
}
