import { useState, useEffect, useRef, useCallback } from "react";

const MODES = {
  WORK: { label: "FOCUS", duration: 25 * 60, color: "#4f8ef7" },
  SHORT: { label: "SHORT BREAK", duration: 5 * 60, color: "#93c5fd" },
  LONG: { label: "LONG BREAK", duration: 15 * 60, color: "#1e40af" },
};

const pad = (n) => String(n).padStart(2, "0");

export default function PomodoroTimer() {
  const [mode, setMode] = useState("WORK");
  const [timeLeft, setTimeLeft] = useState(MODES.WORK.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [flash, setFlash] = useState(false);
  const intervalRef = useRef(null);
  const current = MODES[mode];

  const reset = useCallback((m = mode) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(MODES[m].duration);
  }, [mode]);

  const switchMode = (m) => {
    setMode(m);
    reset(m);
    setTimeLeft(MODES[m].duration);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFlash(true);
            setTimeout(() => setFlash(false), 1000);
            if (mode === "WORK") setSessions((s) => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const progress = 1 - timeLeft / current.duration;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const circumference = 2 * Math.PI * 130;

  return (
    <div style={{
      minHeight: "100vh",
      background: flash ? current.color : "#050d1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#e0eaff",
      transition: "background 0.1s",
      userSelect: "none",
    }}>

      <div style={{ display: "flex", gap: "2px", marginBottom: "48px" }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            style={{
              background: mode === key ? current.color : "transparent",
              color: mode === key ? "#050d1a" : "#2a4a7f",
              border: `1px solid ${mode === key ? current.color : "#1a2f55"}`,
              padding: "8px 18px",
              fontSize: "13px",
              letterSpacing: "0.2em",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
          >
            {val.label}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: "48px" }}>
        <svg width="300" height="300" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="150" cy="150" r="130" fill="none" stroke="#0d1f3c" strokeWidth="3" />
          <circle
            cx="150" cy="150" r="130"
            fill="none"
            stroke={current.color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="square"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
          />
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i / 60) * 2 * Math.PI;
            const x1 = 150 + 125 * Math.cos(angle);
            const y1 = 150 + 125 * Math.sin(angle);
            const x2 = 150 + (i % 5 === 0 ? 113 : 119) * Math.cos(angle);
            const y2 = 150 + (i % 5 === 0 ? 113 : 119) * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={i % 5 === 0 ? "#1a2f55" : "#0d1f3c"}
                strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            );
          })}
        </svg>

        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "76px",
            fontWeight: "700",
            letterSpacing: "-2px",
            color: running ? current.color : "#e0eaff",
            transition: "color 0.3s",
            lineHeight: 1,
          }}>
            {pad(mins)}:{pad(secs)}
          </div>
          <div style={{
            fontSize: "13px",
            letterSpacing: "0.35em",
            color: "#2a4a7f",
            marginTop: "12px",
          }}>
            {running ? "RUNNING" : timeLeft === 0 ? "DONE" : "PAUSED"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "48px" }}>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            background: current.color,
            color: "#050d1a",
            border: "none",
            padding: "16px 42px",
            fontSize: "15px",
            letterSpacing: "0.3em",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "transform 0.1s, opacity 0.2s",
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {running ? "PAUSE" : "START"}
        </button>
        <button
          onClick={() => reset()}
          style={{
            background: "transparent",
            color: "#2a4a7f",
            border: "1px solid #1a2f55",
            padding: "16px 22px",
            fontSize: "15px",
            letterSpacing: "0.2em",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#e0eaff"; e.currentTarget.style.borderColor = "#e0eaff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#2a4a7f"; e.currentTarget.style.borderColor = "#1a2f55"; }}
        >
          ↺
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "13px", letterSpacing: "0.3em", color: "#2a4a7f" }}>SESSIONS COMPLETED</div>
        <div style={{ display: "flex", gap: "6px" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "12px",
                height: "12px",
                background: i < sessions % 8 ? current.color : "#0d1f3c",
                border: `1px solid ${i < sessions % 8 ? current.color : "#1a2f55"}`,
                transition: "background 0.3s, border-color 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1a2f55", letterSpacing: "-1px" }}>
          {String(sessions).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
