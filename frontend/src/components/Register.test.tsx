// Register.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import { AuthContext } from "../context/AuthContext";
// import axios from "axios";
import "@testing-library/jest-dom";
// import '@testing-library/jest-dom';

vi.mock("axios"); 
// const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAuthContextValue = {
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  };

  test("renders all form fields and buttons", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  test("renders Register component", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  test("shows error for invalid email format", async () => {
    window.alert = vi.fn(); // Mock the alert function

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
  });

  test("shows alert for password shorter than required length", async () => {
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
  });
});
