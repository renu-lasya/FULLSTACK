import { useNavigate } from "react-router-dom";

function Viewer() {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem("role");

    navigate("/");

  };

  return (

    <div className="container">

      <h1>👀 Viewer Dashboard</h1>
<h2>Welcome {localStorage.getItem("name")}</h2>
<h3>UID : {localStorage.getItem("uid")}</h3>
<h3>Role : Viewer</h3>
      <h3>Welcome Viewer</h3>

      <p>You can only view content.</p>

      <button onClick={logout}>
        Logout
      </button>

    </div>

  );

}

export default Viewer;