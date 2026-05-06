import { PageTitle } from "@/components/ui";
import { QueriesClient } from "./queries-client";

export const metadata = {
  title: "Natural Queries · BuildVision Data Viewer",
};

const examples = [
  "Which manufacturer dominates Packaged Rooftop Air-Conditioning Units?",
  "Show me the top 10 component types overall.",
  "What is the BOD match vs mismatch breakdown?",
  "Which projects have the most distinct manufacturers?",
  "Show me a pie chart of equipment share for the top 6 manufacturers.",
  "List the projects sorted by equipment count as a table.",
];

export default function QueriesPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="Natural Queries"
        title="Ask anything about the data"
        description="Bring your own Anthropic or OpenAI API key, ask a question in plain English, and the assistant will return a chart or table. The dataset summary is sent to the model so it can compute aggregates accurately. Your key is stored only in your browser."
      />
      <QueriesClient examples={examples} />
    </div>
  );
}
