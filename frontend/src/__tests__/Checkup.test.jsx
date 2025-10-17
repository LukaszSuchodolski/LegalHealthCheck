import { describe, it, expect, vi } from "vitest";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkup from "../pages/Checkup";

vi.mock("@api/checkup", () => ({
  getQuestions: vi.fn().mockResolvedValue({
    version: "1.0",
    questions: [
      { id: "has_employees", text: "Czy masz pracowników?", type: "boolean" },
      { id: "bhp_training", text: "Czy szkolenia BHP są aktualne?", type: "boolean" },
    ],
  }),
  runCheckup: vi.fn().mockResolvedValue({
    score: 42,
    max_score: 100,
    recommendations: [],
  }),
}));

describe("Checkup form", () => {
  it("submits and shows result", async () => {
    render(<Checkup />);
    const user = userEvent.setup();

    await waitForElementToBeRemoved(() => screen.getByText(/loading…/i));

    for (const box of screen.queryAllByRole("checkbox")) {
      await user.click(box);
    }

    const btn = await screen.findByRole("button", { name: /wyślij/i });
    await user.click(btn);

    expect(await screen.findByText(/42/)).toBeInTheDocument();
  });
});
