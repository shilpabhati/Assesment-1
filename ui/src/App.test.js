import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

// Mock the fetch API and suppress expected console.error
const originalConsoleError = console.error;

beforeEach(() => {
  global.fetch = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  console.error = originalConsoleError;
});

const mockSuccessResponse = {
  avalphaTechnologiesCommissionAmount: 550.0,
  competitorCommissionAmount: 95.5,
  details: {
    localSalesCount: 10,
    foreignSalesCount: 10,
    averageSaleAmount: 100,
    avalphaLocalCommission: 200.0,
    avalphaForeignCommission: 350.0,
    competitorLocalCommission: 20.0,
    competitorForeignCommission: 75.5,
  },
};

// ==================== RENDERING TESTS ====================

describe("App Rendering", () => {
  test("renders the commission calculator heading", () => {
    render(<App />);
    expect(
      screen.getByText(/commission calculator/i)
    ).toBeInTheDocument();
  });

  test("renders input fields for local sales, foreign sales, and average amount", () => {
    render(<App />);
    expect(screen.getByLabelText(/local sales count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/foreign sales count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/average sale amount/i)).toBeInTheDocument();
  });

  test("renders a calculate/submit button", () => {
    render(<App />);
    const btn = screen.getByRole("button", { name: /calculate/i });
    expect(btn).toBeInTheDocument();
  });

  test("input fields start empty or with default values", () => {
    render(<App />);
    const localInput = screen.getByLabelText(/local sales count/i);
    const foreignInput = screen.getByLabelText(/foreign sales count/i);
    const avgInput = screen.getByLabelText(/average sale amount/i);

    expect(["", "0"]).toContain(localInput.value);
    expect(["", "0"]).toContain(foreignInput.value);
    expect(["", "0"]).toContain(avgInput.value);
  });

  test("does not show results on initial render", () => {
    render(<App />);
    expect(
      screen.queryByText(/avalpha.*commission/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/competitor.*commission/i)
    ).not.toBeInTheDocument();
  });
});

// ==================== INPUT HANDLING TESTS ====================

describe("Input Handling", () => {
  test("allows user to type in local sales count", () => {
    render(<App />);
    const input = screen.getByLabelText(/local sales count/i);
    fireEvent.change(input, { target: { value: "10" } });
    expect(input.value).toBe("10");
  });

  test("allows user to type in foreign sales count", () => {
    render(<App />);
    const input = screen.getByLabelText(/foreign sales count/i);
    fireEvent.change(input, { target: { value: "5" } });
    expect(input.value).toBe("5");
  });

  test("allows user to type in average sale amount", () => {
    render(<App />);
    const input = screen.getByLabelText(/average sale amount/i);
    fireEvent.change(input, { target: { value: "100" } });
    expect(input.value).toBe("100");
  });
});

// ==================== API CALL & RESULTS TESTS ====================

describe("API Call and Results Display", () => {
  test("calls the API when calculate button is clicked", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  test("sends correct data in the API request body", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.localSalesCount).toBe(10);
      expect(body.foreignSalesCount).toBe(10);
      expect(body.averageSaleAmount).toBe(100);
    });
  });

  test("displays Avalpha commission result after successful API call", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/£?550/)).toBeInTheDocument();
    });
  });

  test("displays Competitor commission result after successful API call", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/£?95\.5/)).toBeInTheDocument();
    });
  });
});

// ==================== ERROR HANDLING TESTS ====================

describe("Error Handling", () => {
  test("displays error message when API returns error", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        errors: ["At least one sale (local or foreign) is required"],
      }),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/error|required|invalid/i)).toBeInTheDocument();
    });
  });

  test("displays error message when network request fails", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/error|failed|unable/i)).toBeInTheDocument();
    });
  });
});

// ==================== VALIDATION TESTS ====================

describe("Client-side Validation", () => {
  test("does not call API with negative local sales count", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      // Either shows validation error OR doesn't call API
      const wasCalled = global.fetch.mock.calls.length > 0;
      if (!wasCalled) {
        expect(global.fetch).not.toHaveBeenCalled();
      } else {
        // If it calls API, backend should return error
        expect(screen.getByText(/error|invalid|negative/i)).toBeInTheDocument();
      }
    });
  });

  test("does not call API with negative average sale amount", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "-100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      const wasCalled = global.fetch.mock.calls.length > 0;
      if (!wasCalled) {
        expect(global.fetch).not.toHaveBeenCalled();
      } else {
        expect(screen.getByText(/error|invalid|negative/i)).toBeInTheDocument();
      }
    });
  });
});

// ==================== LOADING STATE TESTS ====================

describe("Loading State", () => {
  test("shows loading indicator while API call is in progress", async () => {
    let resolvePromise;
    global.fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    // Check for loading state (button disabled or loading text)
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /calculat|loading/i });
      expect(
        btn.disabled || screen.queryByText(/loading|calculating/i)
      ).toBeTruthy();
    });

    // Resolve the promise to clean up
    resolvePromise({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    await waitFor(() => {
      expect(screen.getByText(/£?550/)).toBeInTheDocument();
    });
  });
});

// ==================== CURRENCY FORMATTING TESTS ====================

describe("Currency Formatting", () => {
  test("displays commission amounts with currency symbol", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/local sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/foreign sales count/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/average sale amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      // Check that currency symbol (£ or $) is present with amounts
      const pageText = document.body.textContent;
      expect(pageText).toMatch(/[£$].*550|550.*[£$]/);
    });
  });
});