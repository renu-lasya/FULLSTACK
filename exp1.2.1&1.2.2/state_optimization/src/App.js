import "./App.css";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost, deletePost } from "./features/posts/postSlice";
import {
  selectAllPosts,
  selectPostCount
} from "./selectors/postSelectors";

function App() {

  const [text, setText] = useState("");
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  const totalPosts = useSelector(selectPostCount);

  const allPosts = useSelector(selectAllPosts);

const posts = search.trim() === ""
  ? allPosts
  : allPosts.filter(post =>
      post.text.toLowerCase().includes(search.toLowerCase())
    );

  const memoizedPosts = useMemo(() => posts, [posts]);

  const handleAdd = () => {
console.log("Button Clicked");
    if (text.trim() === "") return;

    dispatch(
      addPost({
        id: Date.now(),
        text: text,
      })
    );

    setText("");
  };

  return (
    <div className="container">

      <h1>⚡ State Optimization</h1>

      <h3>Total Posts : {totalPosts}</h3>

      <div className="input-area">

        <input
          type="text"
          placeholder="Write Post..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          className="add-btn"
          onClick={handleAdd}
        >
          Add
        </button>

      </div>

      <input
  className="search-box"
  placeholder="Search Posts..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

      <div className="post-list">

        {memoizedPosts.map((post) => (

          <div className="post-card" key={post.id}>

            <span>{post.text}</span>

            <button
              className="delete-btn"
              onClick={() => dispatch(deletePost(post.id))}
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;