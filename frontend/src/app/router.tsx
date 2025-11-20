import { createBrowserRouter } from "react-router-dom";

import { Intro, SongSelect, Start, GameMain } from "../pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Start />,
  },
  {
    path: "/game/intro",
    element: <Intro />,
  },
  {
    path: "/game/select",
    element: <SongSelect />,
  },
  {
    path: "/game/main",
    element: <GameMain />,
  },
]);
