import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

interface Ethereum {
  request: (args: { method: string }) => Promise<string[]>;
}

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

const mockEthereum = {
  request: vi.fn().mockResolvedValue(["mocked-wallet-address"]),
};
global.window.ethereum = mockEthereum;

describe("Dashboard Component", () => {
  const mockLogout = vi.fn();
  const mockLogin = vi.fn();
  const mockAuthContextValue = {
    token: "mock-token",
    login: mockLogin,
    logout: mockLogout,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the dashboard and initial elements", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to the Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect to MetaMask/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test("connects to MetaMask on button click", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Connect to MetaMask/i));

    await waitFor(() => {
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: "eth_requestAccounts",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Connected Wallet: mocked-wallet-address/i)
      ).toBeInTheDocument();
    });
  });

  test("fetches and displays titles", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          uuid: "1",
          title: "Test Title",
          createdAt: "2024-11-01T00:00:00",
          updatedAt: "2024-11-01T00:00:00",
          deletedAt: null,
        },
      ],
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
  });

  test("adds a new title successfully", async () => {
    const newTitle = "New Test Title";
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        uuid: "2",
        title: newTitle,
        createdAt: "2024-11-02T00:00:00",
        updatedAt: "2024-11-02T00:00:00",
        deletedAt: null,
      },
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new title"), {
      target: { value: newTitle },
    });
    fireEvent.click(screen.getByText(/Add Title/i));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/title/",
        { title: newTitle },
        { headers: { Authorization: "mock-token" } }
      );
    });

    expect(screen.getByText(newTitle)).toBeInTheDocument();
  });

  test("handles errors when API calls fail", async () => {
    // Simulate error for adding a title
    mockedAxios.post.mockRejectedValueOnce(new Error("Failed to add title"));

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new title"), {
      target: { value: "Test Title" },
    });
    fireEvent.click(screen.getByText(/Add Title/i));

    await waitFor(() => {
      expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
    });
  });
});
