import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// In development, unregister any legacy service workers that might cache stale modules
if ("serviceWorker" in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().then(() => console.log("Unregistered legacy SW in dev mode:", reg.scope));
      }
    });
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Critical rendering error in SevaSetu Root:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#F8FAFC",
          color: "#0F172A"
        }}>
          <div style={{
            maxWidth: "500px",
            backgroundColor: "#FFFFFF",
            padding: "32px",
            borderRadius: "24px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            textAlign: "center"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px"
            }}>⚠️</div>
            <h2 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>Rendering Recovery Active</h2>
            <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "20px" }}>
              {this.state.error?.message || "An unexpected interface error occurred."}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Reset Cache & Reload Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);

