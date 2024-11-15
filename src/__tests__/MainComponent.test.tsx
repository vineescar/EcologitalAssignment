import React from "react";
import { render, screen } from "@testing-library/react";
import MainComponent from "../components/MainComponent";
import "@testing-library/jest-dom";

describe("MainComponent", () => {
  test("renders the MainComponent with the correct text", () => {
    render(<MainComponent />);

    const textElement = screen.getByText("Select or add your rooms to continue");
    expect(textElement).toBeInTheDocument();
  });
});
