# Commission Calculator — README Notes

## 📋 Overview

A full-stack Commission Calculator for Avalpha Technologies that compares commission structures between Avalpha and competitors. Built with a **React** frontend and **.NET 9 (C#)** backend API.

---

## 🚀 How to Run

### Prerequisites

- .NET 9 SDK
- Node.js (v16+)
- npm

### Backend (API)

```bash
cd api
dotnet restore
dotnet run
```

The API will start on `http://localhost:5111`

### Frontend (React)

```bash
cd ui/my-app
npm install
npm start
```

The app will open at `http://localhost:3000`

---

## 🧪 How to Test

### Backend Tests (xUnit)

```bash
cd api/AvalphaTechnologies.CommissionCalculator.Tests
dotnet test
```

### Frontend Tests (Jest + React Testing Library)

```bash
cd ui/my-app
npm test
```

---

## 🧠 Design Decisions

### Backend

- **Controller-based approach**: Used a single `CommisionController` with a POST endpoint for commission calculations. Keeps logic centralised and easy to test.
- **Constants for rates**: Commission rates are defined as `const` fields for maintainability. If rates change, only one place needs updating.
- **Manual validation + Data Annotations**: Used both `[Range]` attributes on the request model and manual validation in the controller for comprehensive input checking.
- **Detailed response DTO**: The response includes a `Details` object with a breakdown of local/foreign commissions for both Avalpha and Competitor, enabling a richer UI display.
- **Rounding**: All monetary values are rounded to 2 decimal places using `Math.Round()` to avoid floating-point display issues.

### Frontend

- **Fetch API**: Used native `fetch` instead of Axios to keep dependencies minimal.
- **Client-side validation**: Validates inputs before sending to the API (non-negative values, at least one sale required) to provide immediate user feedback.
- **Error handling**: Handles both API validation errors (400 responses) and network failures with user-friendly messages.
- **Currency formatting**: Results displayed with `£` symbol and proper decimal formatting.
- **Loading state**: Button is disabled during API calls to prevent duplicate submissions.

### Testing

- **Backend (18 tests)**: Covers happy path calculations, validation errors, boundary values, and parameterised theory tests for commission rate verification.
- **Frontend (18 tests)**: Covers rendering, input handling, API integration (mocked), error handling, validation, loading states, and currency formatting.
- **Mocking strategy**: Frontend tests mock `fetch` globally and suppress expected `console.error` output for clean test runs.

---

## ⚖️ Trade-offs

| Decision | Rationale |
|----------|-----------|
| All logic in controller | For a small app, a separate service layer would be over-engineering. If this grew, I'd extract a `CommissionService`. |
| No TypeScript in frontend | The scaffolded project used JavaScript (CRA). Converting to TypeScript was out of scope for the timebox. |
| Manual validation over FluentValidation | Kept it simple with inline checks. For a larger API, FluentValidation would be preferable. |
| No integration tests | Focused on unit tests for both layers. Integration tests (e.g., WebApplicationFactory) would be a next step. |
| Test project inside api folder | Required excluding test folder from main `.csproj` to prevent compilation conflicts. A sibling folder structure would be cleaner. |

---

## 🔮 What I'd Improve with More Time

- **TypeScript** for the React frontend for type safety
- **Integration tests** using `WebApplicationFactory` for end-to-end API testing
- **Extract a service layer** (`ICommissionService`) for better separation of concerns
- **Add Swagger/OpenAPI** documentation for the API
- **Responsive design** improvements for mobile
- **CI/CD pipeline** (GitHub Actions) for automated testing on PR
- **Environment-based API URL** configuration instead of hardcoded localhost

---

## 📁 Project Structure

```
ASSESMENT-1/
├── api/
│   ├── Controllers/
│   │   └── CommisionController.cs
│   ├── AvalphaTechnologies.CommissionCalculator.csproj
│   ├── AvalphaTechnologies.CommissionCalculator.Tests/
│   │   ├── CommisionControllerTests.cs
│   │   └── AvalphaTechnologies.CommissionCalculator.Tests.csproj
│   ├── Program.cs
│   └── ...
├── ui/
│   └── my-app/
│       └── src/
│           ├── App.js
│           ├── App.test.js
│           └── ...
└── README-notes.md
```