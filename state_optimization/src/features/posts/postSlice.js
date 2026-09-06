import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  posts: [
    { id: 1, text: "React is Awesome" },
    { id: 2, text: "Redux Toolkit simplifies state management" },
    { id: 3, text: "Memoized selectors improve performance" }
  ]
};
const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.posts.push(action.payload);
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter(
        post => post.id !== action.payload
      );
    }
  }
});
export const { addPost, deletePost } = postSlice.actions;
export default postSlice.reducer;