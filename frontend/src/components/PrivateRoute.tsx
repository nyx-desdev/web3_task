// src/components/PrivateRoute.tsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { token } = useContext(AuthContext)!;
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
