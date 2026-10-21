import { createBrowserRouter } from "react-router-dom";

import {
  Auth,
  Editor,
  GameMain,
  GameResult,
  Intro,
  SignIn,
  SignUp,
  SongSelect,
} from "../pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Intro />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/auth/signin",
    element: <SignIn />,
  },
  {
    path: "/auth/signup",
    element: <SignUp />,
  },
  {
    path: "/game/select",
    element: <SongSelect />,
  },
  {
    path: "/game/main",
    element: <GameMain />,
  },
  {
    path: "/game/result",
    element: <GameResult />,
  },
  {
    path: "/game/editor",
    element: <Editor />,
  },
]);
