// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
} from "react-router-dom";

import "./index.css";

// App & Global Components
import App from "./App.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import OAuthCallback from "./pages/OAuthCallback.jsx";
import HomeRedirect from "./pages/HomeRedirect.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SocialFeed from "./pages/SocialFeed.jsx";
import Post from "./pages/Post.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import MyRoutines from "./pages/MyRoutines.jsx";
import NewRoutine from "./pages/NewRoutine.jsx";
import RoutineDetail from "./pages/RoutineDetail.jsx";
import RoutineEdit from "./pages/RoutineEdit.jsx";
import { SearchPage } from "./features/search/index.js";

// ✨ 목표 관리 페이지 import
import MyGoals from "./pages/MyGoals.jsx";
import NewGoalPage from "./pages/NewGoalPage.jsx";

function RouterError() {
  const err = useRouteError();
  console.error(err);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">문제가 발생했어요 😥</h1>
      <p className="mt-2 text-gray-600">잠시 후 다시 시도해 주세요.</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouterError />,
    children: [
      { path: "/", element: <HomeRedirect /> },
      { path: "/landing", element: <LandingPage /> },
      { path: "/feed", element: <SocialFeed /> },

      // 인증
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/oauth2/callback", element: <OAuthCallback /> },

      // 포스트 (인증 필요)
      { path: "/post", element: <ProtectedRoute><Post /></ProtectedRoute> },
      { path: "/post/:postId", element: <ProtectedRoute><PostDetail /></ProtectedRoute> },

      // 프로필 (인증 필요)
      { path: "/profile", element: <ProtectedRoute><MyProfile /></ProtectedRoute> },
      { path: "/profile/:userId", element: <ProtectedRoute><UserProfile /></ProtectedRoute> },
      {
        path: "/my-posts",
        element: (
          <ProtectedRoute>
            <MyPosts />
          </ProtectedRoute>
        ),
      },
      // 루틴 (인증 필요)
      { path: "/routines", element: <ProtectedRoute><MyRoutines /></ProtectedRoute> },
      { path: "/routines/new", element: <ProtectedRoute><NewRoutine /></ProtectedRoute> },
      { path: "/routines/:id", element: <ProtectedRoute><RoutineDetail /></ProtectedRoute> },
      { path: "/routines/edit/:id", element: <ProtectedRoute><RoutineEdit /></ProtectedRoute> },

      // ✨ 목표 관리 (인증 필요)
      { path: "/goals", element: <ProtectedRoute><MyGoals /></ProtectedRoute> },
      { path: "/goals/new", element: <ProtectedRoute><NewGoalPage /></ProtectedRoute> },

      // 검색
      { path: "/search", element: <SearchPage /> },

      { path: "*", element: <div className="p-6">페이지를 찾을 수 없어요</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);