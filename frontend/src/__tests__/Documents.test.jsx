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
  });
});
