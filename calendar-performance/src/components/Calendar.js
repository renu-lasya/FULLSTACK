import { useState, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
function Calendar() {

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Instagram Post",
      date: "2026-08-05"
    },
    {
      id: "2",
      title: "LinkedIn Post",
      date: "2026-08-10"
    },
     {
    id: "3",
    title: "RENULASYA",
    date: "2026-07-28",
    color: "green"        // Completed
  }
  ]);

  const totalEvents = useMemo(() => {
    return events.length;
  }, [events]);

  const handleAdd = useCallback(() => {

    if (title === "" || date === "") {

      alert("Enter Title and Date");

      return;

    }

    setEvents([
  ...events,
  {
    id: Date.now().toString(),
    title: title,
    date: date,
    color: "#7c3aed"   // New posts are Scheduled (Purple)
  }
]);

    setTitle("");
    setDate("");

  }, [title, date, events]);

  return (

    <div>
<div className="form">

  <input
    type="text"
    placeholder="Enter Post Title"
    value={title}
    onChange={(e)=>setTitle(e.target.value)}
  />

  <input
    type="date"
    value={date}
    onChange={(e)=>setDate(e.target.value)}
  />

  <button onClick={handleAdd}>
    Schedule
  </button>

</div>

<h2 className="total-posts">
  Total Scheduled Posts : {totalEvents}
</h2>
<div className="stats">

    <div className="stat-card">
        <h3>Total Posts</h3>
        <p>{events.length}</p>
    </div>

    <div className="stat-card">
        <h3>Performance</h3>
        <p>Optimized ⚡</p>
    </div>

    <div className="stat-card">
        <h3>Testing</h3>
        <p>Passed ✅</p>
    </div>

</div>
<div className="date-card">
  📅 Today : {new Date().toDateString()}
</div>
<div className="legend">

<span className="purple"></span> Scheduled Post

<span className="green"></span> Completed

<span className="orange"></span> Upcoming

</div>
<FullCalendar

        plugins={[
          dayGridPlugin,
          interactionPlugin
        ]}

        initialView="dayGridMonth"

        editable={true}

        selectable={true}

        events={events}

        eventClick={(info) => {

          alert("Post : " + info.event.title);

        }}

      />

    </div>

  );

}

export default Calendar;