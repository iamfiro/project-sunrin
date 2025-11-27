import { createBrowserRouter } from "react-router-dom";

import {
  Auth,
  Editor,
  GameMain,
  Intro,
  Loading,
  SignIn,
  SignUp,
  SongSelect,
  Start,
} from "../pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Start />,
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
    path: "/game/intro",
    element: <Intro />,
  },
  {
    path: "/game/loading",
    element: <Loading />,
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
    path: "/game/editor",
    element: <Editor />,
  },
]);
