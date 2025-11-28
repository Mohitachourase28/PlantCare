// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // if token exists, render children; otherwise redirect to login and preserve where user wanted to go
  if (token) return children;

  return (
    <Navigate
      to={redirectTo}
      replace
      state={{ from: location.pathname + location.search }}
    />
  );
}
