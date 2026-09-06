# Experiment 1.2.2 – State Optimization

## Aim
To optimize state access and improve application performance using memoized selectors.

## Objectives
- To understand derived state.
- To implement memoized selectors.
- To reduce unnecessary calculations.
- To improve application performance.

## Technologies Used
- React.js
- Redux Toolkit
- Reselect / createSelector
- JavaScript
- Node.js
- VS Code

## Description
This experiment demonstrates how selectors can be used to efficiently access and process Redux state.

Memoized selectors store previously calculated results and recalculate them only when the required state changes. This helps reduce unnecessary computations and improves application performance.

## Implementation
- Created selectors to access Redux state.
- Implemented memoized selectors using `createSelector`.
- Created derived data such as filtered posts.
- Used selectors inside React components.
- Reduced unnecessary calculations and re-renders.

## Expected Outcome
- Efficient state access is achieved.
- Unnecessary calculations are reduced.
- Rendering performance is improved.
- The application becomes more scalable and efficient.
