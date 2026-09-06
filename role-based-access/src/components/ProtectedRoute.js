import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {

  const userRole = localStorage.getItem("role");

  if (userRole === role) {

    return children;

  }

  return <Navigate to="/unauthorized" />;

}

export default ProtectedRoute;