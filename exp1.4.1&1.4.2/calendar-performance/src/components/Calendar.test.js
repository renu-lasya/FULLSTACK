import { render, screen } from "@testing-library/react";
import Calendar from "./Calendar";

test("renders schedule button", () => {
  render(<Calendar />);
  const button = screen.getByText(/Schedule/i);
  expect(button).toBeInTheDocument();
});