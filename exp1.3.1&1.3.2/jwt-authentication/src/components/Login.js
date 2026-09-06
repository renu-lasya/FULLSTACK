import React, { useState, useEffect } from "react";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  useEffect(() => {
  const token = localStorage.getItem("token");
  if(token){
    try{
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    }
    catch{
      localStorage.removeItem("token");
    }
  }
}, []);
  const handleLogin = () => {
  if (username === "RENULASYA" && password === "1234") {

    const payload = {
        username: "RENULASYA",
        uid: "24BAI70210",
        role: "Student"
    };

    const token =
      "header." +
      btoa(JSON.stringify(payload)) +
      ".signature";

    localStorage.setItem("token", token);

    setUser(payload);

} else {

    alert("Invalid Username or Password");

}
};
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUsername("");
    setPassword("");
  };
  return (
    <div className="container">
      <h1>🔐 JWT Authentication</h1>
      {!user ? (
        <div className="login-box">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>
            Login
          </button>
          <p className="note">
  Username : RENULASYA <br/>
  Password : 1234
</p>
        </div>
      ) : (
        <div className="welcome">
  <h2>Welcome {user.username}</h2>

  <h3>UID : {user.uid}</h3>

  <h3>Role : {user.role}</h3>

  <p>✅ Token Generated Successfully</p>

  <button onClick={handleLogout}>
    Logout
  </button>
</div>
      )}
    </div>
  );
}
export default Login;