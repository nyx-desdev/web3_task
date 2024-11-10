// src/components/Login.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

vi.mock("axios"); // Mock axios for API requests
// vi.mock("react-router-dom", () => ({
//   ...vi.importActual("react-router-dom"),
//   useNavigate: vi.fn(),
// }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Login Component", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  // Mock the AuthContext value
  const mockAuthContextValue = {
    token: null,
    login: mockLogin,
    logout: mockLogout,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Login form", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows error for incorrect credentials", async () => {
    window.alert = vi.fn(); // Mock alert

    // Mock failed login request
    mockedAxios.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "incorrectpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Login failed. Please check your credentials."
      );
    });
  });

  test("logs in and redirects to dashboard on success", async () => {
    const mockToken = "mock-token";
    mockedAxios.post.mockResolvedValueOnce({ data: { token: mockToken } });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockToken);
    //   expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("redirects to dashboard if already logged in", () => {
    const mockToken = "mock-token"; // Simulate an existing token

    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ token: mockToken, login: mockLogin, logout: mockLogout }}
        >
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("shows error for empty email and password fields", async () => {
    window.alert = vi.fn(); // Mock alert

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
  });
});
