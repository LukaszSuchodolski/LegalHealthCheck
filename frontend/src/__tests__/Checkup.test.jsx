import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkup from "../pages/Checkup";

vi.mock("../api/checkup", () => ({
  runCheckup: vi.fn().mockResolvedValue({ score: 42, recommendations: [] }),
}));

describe("Checkup form", () => {
  it("submits and shows result", async () => {
    render(<Checkup />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));
    expect(await screen.findByText(/42/)).toBeInTheDocument();
  });
});
