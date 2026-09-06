import { createSelector } from "reselect";

// Basic Selector
const selectPosts = (state) => state.posts.posts;

// Memoized Selector
export const selectAllPosts = createSelector(
  [selectPosts],
  (posts) => posts
);

// Derived State
export const selectPostCount = createSelector(
  [selectPosts],
  (posts) => posts.length
);

// Filtered Posts
export const selectFilteredPosts = createSelector(
  [selectPosts, (state, keyword) => keyword],
  (posts, keyword) => {
    return posts.filter(post =>
      post.text.toLowerCase().includes(keyword.toLowerCase())
    );
  }
);