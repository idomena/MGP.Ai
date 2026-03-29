/**
 * /test-gif — temporary diagnostic page
 * Tests whether the ExerciseDB image proxy is working end-to-end.
 * Remove this page once GIFs are confirmed working in production.
 */

import { useState, useEffect } from "react";

interface TestCase {
  label: string;
  url: string;
}

const EXERCISE_ID = "0001";

const TESTS: TestCase[] = [
  {
    label: "Dedicated route  /api/exercises/image/:id",
    url: `/api/exercises/image/${EXERCISE_ID}`,
  },
  {
    label: "Generic proxy  /api/proxy-image?url=exercisedb.p.rapidapi.com",
    url: `/api/proxy-image?url=${encodeURIComponent(`https://exercisedb.p.rapidapi.com/image/${EXERCISE_ID}`)}`,
  },
  {
    label: "Generic proxy  /api/proxy-image?url=v2.exercisedb.io",
    url: `/api/proxy-image?url=${encodeURIComponent(`https://v2.exercisedb.io/image/${EXERCISE_ID}.gif`)}`,
  },
];

type Status = "pending" | "ok" | "error";

interface Result {
  status: Status;
  httpStatus?: number;
  contentType?: string;
  note?: string;
}

export default function TestGif() {
  const [results, setResults] = useState<Record<string, Result>>(
    Object.fromEntries(TESTS.map(t => [t.url, { status: "pending" }]))
  );

  useEffect(() => {
    TESTS.forEach(async (test) => {
      try {
        const res = await fetch(test.url);
        const contentType = res.headers.get("content-type") || "";
        setResults(prev => ({
          ...prev,
          [test.url]: {
            status: res.ok ? "ok" : "error",
            httpStatus: res.status,
            contentType,
            note: !res.ok ? `HTTP ${res.status}` : undefined,
          },
        }));
      } catch (e: any) {
        setResults(prev => ({
          ...prev,
          [test.url]: { status: "error", note: e.message },
        }));
      }
    });
  }, []);

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh", padding: "2rem", fontFamily: "monospace", color: "#fff" }}>
      <h1 style={{ color: "#aaf163", marginBottom: "0.25rem" }}>GIF Proxy Diagnostic</h1>
      <p style={{ color: "#ffffff60", marginBottom: "2rem", fontSize: "0.85rem" }}>
        Exercise ID: <strong style={{ color: "#7c57ff" }}>{EXERCISE_ID}</strong>
        &nbsp;·&nbsp;API host: <strong style={{ color: "#60a5fa" }}>exercisedb.p.rapidapi.com</strong>
      </p>

      {TESTS.map((test) => {
        const result = results[test.url];
        const statusColor =
          result.status === "ok" ? "#aaf163" :
          result.status === "error" ? "#f87171" : "#ffffff50";

        return (
          <div
            key={test.url}
            style={{
              background: "#1a1a2e",
              border: "1px solid #ffffff10",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>
                {result.status === "pending" ? "⏳" : result.status === "ok" ? "✅" : "❌"}
              </span>
              <span style={{ color: "#ffffffcc", fontSize: "0.85rem" }}>{test.label}</span>
              {result.httpStatus && (
                <span style={{ marginLeft: "auto", color: statusColor, fontSize: "0.8rem" }}>
                  HTTP {result.httpStatus}
                </span>
              )}
            </div>

            <div style={{ color: "#ffffff40", fontSize: "0.75rem", marginBottom: "0.75rem", wordBreak: "break-all" }}>
              {test.url}
            </div>

            {result.status === "ok" && (
              <img
                src={test.url}
                alt={`Exercise ${EXERCISE_ID}`}
                style={{ maxWidth: "220px", borderRadius: "8px", display: "block", background: "#ffffff10" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  setResults(prev => ({
                    ...prev,
                    [test.url]: { ...prev[test.url], status: "error", note: "img tag failed to render" },
                  }));
                }}
              />
            )}

            {result.status === "error" && (
              <div style={{ color: "#f87171", fontSize: "0.8rem" }}>
                {result.note || `HTTP ${result.httpStatus}`}
                {result.contentType && <span style={{ color: "#ffffff30" }}> · {result.contentType}</span>}
              </div>
            )}
          </div>
        );
      })}

      <p style={{ color: "#ffffff30", fontSize: "0.75rem", marginTop: "2rem" }}>
        ⚠ Remove <code style={{ color: "#7c57ff" }}>src/pages/TestGif.tsx</code> and its route once GIFs are confirmed working.
      </p>
    </div>
  );
}
