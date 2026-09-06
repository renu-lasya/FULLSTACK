import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {

    // Create
    addPost: (state, action) => {
        state.posts.push(action.payload);
    },

    // Update
    updatePost: (state, action) => {
        const { id, text } = action.payload;

        const post = state.posts.find(
            post => post.id === id
        );

        if(post){
            post.text = text;
        }
    },

    // Delete
    deletePost: (state, action) => {
        state.posts = state.posts.filter(
            post => post.id !== action.payload
        );
    }

},
});

export const { addPost,updatePost, deletePost } = postsSlice.actions;

export default postsSlice.reducer;