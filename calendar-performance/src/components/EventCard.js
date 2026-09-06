import React from "react";

function EventCard({ count }) {

  console.log("EventCard Rendered");

  return (

    <div className="card">

      <h2>📌 Performance Summary</h2>

      <p>Total Scheduled Posts : {count}</p>

      <p>✔ React.memo() Applied</p>

      <p>✔ useMemo() Applied</p>

      <p>✔ useCallback() Applied</p>

    </div>

  );

}

export default React.memo(EventCard);