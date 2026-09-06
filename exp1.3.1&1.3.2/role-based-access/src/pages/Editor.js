import { useNavigate } from "react-router-dom";

function Editor() {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem("role");

    navigate("/");

  };

  return (

    <div className="container">

      <h1>✍ Editor Dashboard</h1>

      <h3>Welcome Editor</h3>
<h2>Welcome {localStorage.getItem("name")}</h2>
<h3>UID : {localStorage.getItem("uid")}</h3>
<h3>Role : Editor</h3>
      <p>You can edit content.</p>

      <button onClick={logout}>
        Logout
      </button>

    </div>

  );

}

export default Editor;