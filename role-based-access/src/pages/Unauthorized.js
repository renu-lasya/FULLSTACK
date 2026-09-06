import { Link } from "react-router-dom";

function Unauthorized() {

  return (

    <div className="container">

      <h1>❌ Unauthorized Access</h1>

      <p>You don't have permission to access this page.</p>

      <Link to="/">
        Go Back
      </Link>

    </div>

  );

}

export default Unauthorized;