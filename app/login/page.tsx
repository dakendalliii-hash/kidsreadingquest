"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { loginAction } from "./actions";

export default function LoginPage() {
  const params = useSearchParams();

  const errorMessage = params.get("error") || "";
  const attemptsParam = params.get("attempts") || "0";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { pending } = useFormStatus();

  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        padding: "80px 40px 40px 40px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "16px",
          padding: "40px",
          width: "85%",
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{
            color: "black",
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Login
        </h1>

        <form action={loginAction}>
          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label
              htmlFor="email"
              style={{
                color: "black",
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@email_provider.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label
              htmlFor="password"
              style={{
                color: "black",
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />

            {errorMessage && (
              <p
                style={{
                  color: "red",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                {errorMessage}
              </p>
            )}

            {attemptsParam && (
              <p
                style={{
                  color: "black",
                  fontWeight: "bold",
                  marginTop: "4px",
                }}
              >
                Attempts: {attemptsParam} / 5
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary form-single-button"
            style={{
              width: "100%",
              fontWeight: "bold",
              fontSize: "1rem",
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? "Logging in..." : "Login"}
          </button>

          <div style={{ marginTop: "12px" }}>
            <a
              href="/forgot-password"
              style={{
                color: "#2c3e50",
                fontWeight: "bold",
                textDecoration: "underline",
                fontSize: "0.95rem",
              }}
            >
              Forgot Password?
            </a>

            <p
              style={{
                marginTop: "8px",
                color: "#2c3e50",
                fontSize: "0.9rem",
                lineHeight: "1.4",
                fontWeight: "bold",
              }}
            >
              No problem. Enter your email and we’ll send you a secure reset link so you can get back in.
            </p>
          </div>

          <div style={{ marginTop: "8px" }}>
            <a
              href="/signup"
              style={{
                color: "#2c3e50",
                fontWeight: "bold",
                textDecoration: "underline",
                fontSize: "0.95rem",
              }}
            >
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
