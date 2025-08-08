"use client";
import { useEffect, useState } from "react";

export default function AgentPage() {
  const [query, setQuery] = useState("Latest iron ore price FOB China");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setAnswer(null);
    const res = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    const data = await res.json();
    setAnswer(data.answer ?? JSON.stringify(data));
    setLoading(false);
  }

  useEffect(() => {
    ask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">AI Price Agent</h1>
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Ask about ore prices..." />
        <button onClick={ask} className="px-4 py-2 rounded bg-black text-white" disabled={loading}>{loading ? "Asking..." : "Ask"}</button>
      </div>
      {answer && (
        <div className="rounded border bg-white p-4">
          <div className="font-medium mb-2">Answer</div>
          <div className="whitespace-pre-wrap text-sm">{answer}</div>
        </div>
      )}
    </div>
  );
}