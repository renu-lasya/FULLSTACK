import { useNavigate } from "react-router-dom";

function Admin() {

  const navigate = useNavigate();

  const name = localStorage.getItem("name");
  const uid = localStorage.getItem("uid");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="container">
      <h1>👨‍💼 Admin Dashboard</h1>

      <h2>Welcome {name}</h2>

      <h3>UID : {uid}</h3>

      <h3>Role : Admin</h3>

      <p>You have full access.</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Admin;