import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {

    if (role === "") {
      alert("Please Select a Role");
      return;
    }

    localStorage.setItem("role", role);
    localStorage.setItem("name", "RENULASYA");
    localStorage.setItem("uid", "24BAI70210");

    if (role === "Admin") {
      navigate("/admin");
    } else if (role === "Editor") {
      navigate("/editor");
    } else {
      navigate("/viewer");
    }
  };

  return (
    <div className="container">

      <h1>Role Based Access Control</h1>

      <h3>Select Your Role</h3>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="Admin">Admin</option>
        <option value="Editor">Editor</option>
        <option value="Viewer">Viewer</option>
      </select>

      <br /><br />

      <button onClick={handleLogin}>
        Login
      </button>

    </div>
  );
}

export default Login;