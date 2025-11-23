import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Loading } from "../pages";

const Start = lazy(() => import("../pages/start"));
const Auth = lazy(() => import("../pages/auth"));
const SignIn = lazy(() => import("../pages/auth/signin"));
const SignUp = lazy(() => import("../pages/auth/signup"));
const Intro = lazy(() => import("../pages/intro"));
const SongSelect = lazy(() => import("../pages/game/select"));

const withFallback = (element: JSX.Element) => (
  <Suspense fallback={<Loading />}>{element}</Suspense>
);

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
]);
