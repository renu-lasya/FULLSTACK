import "./App.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost, deletePost, updatePost } from "./features/posts/postsSlice";

function App() {

  const [text, setText] = useState("");

  const dispatch = useDispatch();

  const posts = useSelector(state => state.posts.posts);

  const handleAdd = () => {

    if(text.trim()==="") return;

    dispatch(addPost({
      id:Date.now(),
      text:text
    }));

    setText("");
  };

  return (

    <div className="container">

      <h1>📝 Redux Post Manager</h1>

      <div className="input-area">

        <input
        type="text"
        placeholder="Write your post..."
        value={text}
        onChange={(e)=>setText(e.target.value)}
        />

        <button
        className="add-btn"
        onClick={handleAdd}
        >
        Add
        </button>

      </div>
    

           <div className="post-list">

        {posts.map((post) => (

          <div className="post-card" key={post.id}>

            <span>{post.text}</span>

            <div>

              <button
                className="edit-btn"
                onClick={() => {
                  const newText = prompt("Edit your post:", post.text);

                  if (newText !== null && newText.trim() !== "") {
                    dispatch(
                      updatePost({
                        id: post.id,
                        text: newText,
                      })
                    );
                  }
                }}
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => dispatch(deletePost(post.id))}
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default App;