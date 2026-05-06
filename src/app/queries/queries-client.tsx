"use client";

import { useEffect, useState } from "react";
import { Sparkles, Key, Loader2, AlertCircle } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";
import { NLChart, type ChartSpec } from "@/components/nl-chart";

type Provider = "anthropic" | "openai";

const STORAGE_KEY = "bv-nlq-config-v1";

type StoredConfig = {
  provider: Provider;
  apiKey: string;
  model?: string;
};

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: "claude-opus-4-7",
  openai: "gpt-4o-mini",
};

export function QueriesClient({ examples }: { examples: string[] }) {
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODELS.anthropic);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<ChartSpec | null>(null);
  const [showKeyHelp, setShowKeyHelp] = useState(false);

  // Load stored config
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const cfg = JSON.parse(raw) as StoredConfig;
        setProvider(cfg.provider || "anthropic");
        setApiKey(cfg.apiKey || "");
        setModel(cfg.model || DEFAULT_MODELS[cfg.provider || "anthropic"]);
      }
    } catch {}
  }, []);

  function persist(next: Partial<StoredConfig>) {
    const cfg: StoredConfig = {
      provider: next.provider ?? provider,
      apiKey: next.apiKey ?? apiKey,
      model: next.model ?? model,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch {}
  }

  async function ask(q: string) {
    setError(null);
    setSpec(null);
    if (!q.trim()) {
      setError("Type a question.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/nl-query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          question: q,
        }),
      });
      const json = await r.json();
      if (!r.ok) {
        throw new Error(json?.error || `Request failed (${r.status})`);
      }
      setSpec(json.spec as ChartSpec);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: Configuration */}
      <Card className="lg:col-span-1">
        <SectionTitle title="Configuration" />
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-micro font-bold uppercase tracking-wide text-neutral-500">
              Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["anthropic", "openai"] as Provider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProvider(p);
                    setModel(DEFAULT_MODELS[p]);
                    persist({ provider: p, model: DEFAULT_MODELS[p] });
                  }}
                  className={`rounded-lg border px-3 py-2 text-detail font-bold capitalize transition ${
                    provider === p
                      ? "border-bv-blue-400 bg-bv-blue-100 text-bv-blue-400"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-micro font-bold uppercase tracking-wide text-neutral-500">
              <span>API Key</span>
              <button
                onClick={() => setShowKeyHelp((v) => !v)}
                className="text-bv-blue-400 hover:underline"
              >
                Where do I get one?
              </button>
            </label>
            <div className="relative">
              <Key className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  persist({ apiKey: e.target.value });
                }}
                placeholder={
                  provider === "anthropic"
                    ? "sk-ant-… (or leave blank to use server key)"
                    : "sk-… (or leave blank to use server key)"
                }
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-detail text-neutral-800 placeholder:text-neutral-400 focus:border-bv-blue-400 focus:outline-none focus:ring-2 focus:ring-bv-blue-100"
              />
            </div>
            {showKeyHelp && (
              <p className="mt-2 rounded-lg bg-neutral-50 p-3 text-micro text-neutral-600">
                {provider === "anthropic" ? (
                  <>
                    Get an Anthropic API key at{" "}
                    <a
                      className="text-bv-blue-400 hover:underline"
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noreferrer"
                    >
                      console.anthropic.com
                    </a>
                    . Your key is stored in this browser only and sent
                    to your own deployment of this app for proxying.
                  </>
                ) : (
                  <>
                    Get an OpenAI API key at{" "}
                    <a
                      className="text-bv-blue-400 hover:underline"
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                    >
                      platform.openai.com
                    </a>
                    . Your key is stored in this browser only and sent
                    to your own deployment of this app for proxying.
                  </>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-micro font-bold uppercase tracking-wide text-neutral-500">
              Model
            </label>
            <input
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                persist({ model: e.target.value });
              }}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-detail text-neutral-800 focus:border-bv-blue-400 focus:outline-none focus:ring-2 focus:ring-bv-blue-100"
            />
            <p className="mt-1 text-micro text-neutral-500">
              {provider === "anthropic"
                ? "e.g. claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5"
                : "e.g. gpt-4o-mini, gpt-4o, o4-mini"}
            </p>
          </div>
        </div>
      </Card>

      {/* Right: Question + result */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <SectionTitle title="Ask a question" />
          <div className="space-y-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="e.g. Which manufacturer dominates Packaged Rooftop Air-Conditioning Units?"
              className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-body-sm text-neutral-800 placeholder:text-neutral-400 focus:border-bv-blue-400 focus:outline-none focus:ring-2 focus:ring-bv-blue-100"
            />
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setQuestion(ex)}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-micro text-neutral-700 hover:border-bv-blue-300 hover:bg-bv-blue-100 hover:text-bv-blue-400"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => ask(question)}
                disabled={loading}
                className="ml-3 inline-flex shrink-0 items-center gap-2 rounded-lg bg-bv-blue-400 px-4 py-2 text-detail font-bold text-white transition hover:bg-bv-blue-300 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Ask
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="border-bv-red-400 bg-bv-red-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-bv-red-400" />
              <div>
                <p className="text-body-sm font-bold text-bv-red-700">
                  {error}
                </p>
                <p className="mt-1 text-detail text-bv-red-700">
                  Double-check your API key and model name.
                </p>
              </div>
            </div>
          </Card>
        )}

        {spec && (
          <Card>
            <div className="mb-2">
              <h3 className="text-h5 font-bold text-neutral-900">
                {spec.title}
              </h3>
              <p className="mt-1 text-detail text-neutral-600">
                {spec.explanation}
              </p>
            </div>
            <div className="mt-4">
              <NLChart spec={spec} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
