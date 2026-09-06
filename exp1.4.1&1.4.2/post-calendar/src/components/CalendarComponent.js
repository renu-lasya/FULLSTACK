import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

function CalendarComponent() {

  const [title, setTitle] = useState("");

  const [date, setDate] = useState("");

  const [events, setEvents] = useState([]);

  const handleAdd = () => {

    if(title==="" || date===""){

      alert("Enter title and date");

      return;

    }

    setEvents([

      ...events,

      {
        title:title,
        date:date
      }

    ]);

    setTitle("");

    setDate("");

  };

  return(

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

        Schedule Post

        </button>

      </div>

      <FullCalendar

      plugins={[dayGridPlugin,interactionPlugin]}

      initialView="dayGridMonth"

      editable={true}

      selectable={true}

      events={events}

      eventClick={(info)=>{

      alert("Post : "+info.event.title);

      }}

      />

    </div>

  );

}

export default CalendarComponent;