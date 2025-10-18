import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import Documents from "../pages/Documents";

const { requestMock, getMock, postMock, deleteMock, urlMock } = vi.hoisted(
  () => ({
    requestMock: vi.fn(),
    getMock: vi.fn(),
    postMock: vi.fn(),
    deleteMock: vi.fn(),
    urlMock: vi.fn(),
  }),
);

vi.mock("../api/http", () => ({
  __esModule: true,
  default: {
    request: requestMock,
    get: getMock,
    post: postMock,
    delete: deleteMock,
    url: urlMock,
  },
  request: requestMock,
  url: urlMock,
}));

describe("Documents page", () => {
  beforeEach(() => {
    requestMock.mockReset();
    getMock.mockReset();
    postMock.mockReset();
    deleteMock.mockReset();
    urlMock.mockReset();
    urlMock.mockImplementation((path) => path);
    window.open = vi.fn();
  });

  it("fetches templates using http.get", async () => {
    getMock.mockResolvedValueOnce([{ id: 1, title: "Doc" }]);
    getMock.mockResolvedValueOnce([]);

    render(<Documents />);

    await waitFor(() =>
      expect(getMock).toHaveBeenCalledWith("/api/v1/documents/templates"),
    );
  });

  it("builds download URLs through http.url", async () => {
    getMock.mockResolvedValueOnce([{ id: 1, title: "Doc" }]);
    getMock.mockResolvedValueOnce([]);
    urlMock.mockImplementation((path) => `https://api.test${path}`);

    render(<Documents />);

    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));

    screen.getByRole("button", { name: "Pobierz" }).click();

    expect(urlMock).toHaveBeenCalledWith(
      "/api/v1/documents/templates/download/1",
    );
    expect(window.open).toHaveBeenCalledWith(
      "https://api.test/api/v1/documents/templates/download/1",
      "_blank",
    );
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
