import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import messages from "../../../../messages/en.json";
import { LoginForm } from "./login-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/en/login",
  useParams: () => ({ locale: "en" }),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  notFound: vi.fn(),
}));

function renderForm() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <LoginForm />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("LoginForm", () => {
  it("labels every input", () => {
    renderForm();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("shows translated validation errors", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("This field is required.")).toBeInTheDocument();
  });

  it("links to password reset and registration", () => {
    renderForm();
    expect(screen.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
      "href",
      "/en/forgot-password",
    );
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/en/register");
  });
});
