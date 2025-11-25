import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Intro, SongSelect, Start, GameMain } from "../pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: withFallback(<Start />),
  },
  {
    path: "/auth",
    element: withFallback(<Auth />),
  },
  {
    path: "/auth/signin",
    element: withFallback(<SignIn />),
  },
  {
    path: "/auth/signup",
    element: withFallback(<SignUp />),
  },
  {
    path: "/game/intro",
    element: withFallback(<Intro />),
  },
  {
    path: "/game/loading",
    element: <Loading />,
  },
  {
    path: "/game/select",
    element: withFallback(<SongSelect />),
  },
  {
    path: "/game/main",
    element: <GameMain />,
  },
]);
