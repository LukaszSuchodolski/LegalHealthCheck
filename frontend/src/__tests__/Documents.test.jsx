import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Documents from "../pages/Documents";

const mocked = vi.hoisted(() => {
  const get = vi.fn();
  const post = vi.fn();
  const del = vi.fn();
  return {
    instance: {
      defaults: { baseURL: "http://mocked" },
      get,
      post,
      delete: del,
    },
    get,
    post,
    delete: del,
  };
});

vi.mock("../api/http", () => ({
  __esModule: true,
  default: mocked.instance,
}));

const originalOpen = window.open;

describe("Documents page", () => {
  beforeEach(() => {
    mocked.get.mockReset();
    mocked.post.mockReset();
    mocked.delete.mockReset();

    mocked.get.mockImplementation((url) => {
      if (url === "/api/v1/documents/templates") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: "Regulamin pracy",
              category: "HR",
              status: "draft",
            },
          ],
        });
      }
      if (url === "/api/v1/documents/uploads") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    mocked.post.mockResolvedValue({ data: {} });
    mocked.delete.mockResolvedValue({ data: {} });
    window.open = vi.fn();
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  it("pobiera listę szablonów przez helper http", async () => {
    render(<Documents />);

    await waitFor(() => {
      expect(mocked.get).toHaveBeenCalledWith("/api/v1/documents/templates");
    });

    expect(await screen.findByText(/Regulamin pracy/)).toBeInTheDocument();
  });
});
