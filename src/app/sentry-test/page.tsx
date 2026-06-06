"use client";

export default function SentryTest() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Sentry Error Tracking Test</h2>
      <button
        onClick={() => {
          throw new Error("Sentry Test Error from Hanuman Paints");
        }}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Throw intentional error
      </button>
    </div>
  );
}
