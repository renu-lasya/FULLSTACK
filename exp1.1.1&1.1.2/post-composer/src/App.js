import { useState } from "react";

function App() {
  const [platform, setPlatform] = useState("Twitter");
  const [post, setPost] = useState("");

  const limits = {
    Twitter: 280,
    LinkedIn: 3000,
    Instagram: 2200,
  };

  const limit = limits[platform];
  const isExceeded = post.length > limit;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Post Composer</h1>

      <label><b>Select Platform:</b></label>

      <br /><br />

      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option>Twitter</option>
        <option>LinkedIn</option>
        <option>Instagram</option>
      </select>

      <br /><br />

      <label><b>Write Your Post:</b></label>

      <br /><br />

      <textarea
        rows="6"
        cols="60"
        placeholder="Type your post here..."
        value={post}
        onChange={(e) => setPost(e.target.value)}
      ></textarea>

      <br /><br />

      <p>
        Characters: {post.length} / {limit}
      </p>

{isExceeded ? 
  <p style={{ color: "red", fontWeight: "bold" }}>
    ❌ Character limit exceeded!
  </p>
 : (
  <p style={{ color: "green", fontWeight: "bold" }}>
    ✅ Ready to post
  </p>
)}

<br />

<button>Save Draft</button>
    </div>
  );
}

export default App;