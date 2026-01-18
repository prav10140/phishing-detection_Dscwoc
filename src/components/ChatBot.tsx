import { useEffect, useState } from "react";
import { askCodeMate } from "./chatApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  scanResult?: any;
}

export function Chatbot({ scanResult }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto explain when result arrives
  useEffect(() => {
    if (!scanResult) return;

    const explain = async () => {
      setOpen(true);
      setLoading(true);

      const prompt = `
You are a **Phishing Detection Assistant**.

Analyze the scan result below and respond in **clean markdown**.

SCAN RESULT:
${JSON.stringify(scanResult, null, 2)}

FORMAT STRICTLY LIKE THIS:

### 🔍 Scan Result
- **Status:** Safe / Phishing
- **Confidence:** XX%

### ⚠️ Reasons
- Bullet points only

### 📊 Risk Level
- Low / Medium / High

### ✅ Recommendation
- One short sentence only
`;

      const reply = await askCodeMate([
        { role: "user", content: prompt }
      ]);

      setMessages([
        { role: "assistant", text: reply }
      ]);

      setLoading(false);
    };

    explain();
  }, [scanResult]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    const reply = await askCodeMate([
      ...messages.map(m => ({
        role: m.role,
        content: m.text
      })),
      { role: "user", content: input }
    ]);

    setMessages(prev => [
      ...prev,
      { role: "assistant", text: reply }
    ]);

    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: open ? 380 : 60,
        height: open ? 520 : 60,
        background: "#020617",
        color: "#e5e7eb",
        borderRadius: 18,
        zIndex: 9999,
        boxShadow: "0 0 30px rgba(0,0,0,.6)",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* Header */}
<div
  onClick={() => setOpen(!open)}
  style={{
    padding: 14,
    background: "#020617",
    cursor: "pointer",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: open ? 16 : 28
  }}
>
  {open ? "🤖 Security AI" : "💬"}
</div>


      {open && (
        <>
          {/* Messages */}
          <div
            style={{
              padding: 12,
              height: 380,
              overflowY: "auto",
              fontSize: 14
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 14,
                  textAlign: m.role === "user" ? "right" : "left"
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    maxWidth: "90%",
                    padding: 10,
                    borderRadius: 12,
                    background:
                      m.role === "user" ? "#22c55e" : "#0f172a",
                    color: "#fff"
                  }}
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text}
                    </ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}

            {loading && <p>🔍 Analyzing...</p>}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: 10,
              borderTop: "1px solid #1e293b"
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about this result..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: "none",
                outline: "none"
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: 8,
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background: "#22c55e",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
