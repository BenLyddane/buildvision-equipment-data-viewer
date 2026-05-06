import { PageTitle } from "@/components/ui";
import { QueriesClient } from "./queries-client";

export const metadata = {
  title: "Natural Queries · BuildVision Data Viewer",
};

const examples = [
  "Which manufacturer dominates Packaged Rooftop Air-Conditioning Units?",
  "Show me Energy Recovery Unit market share by manufacturer as a pie chart.",
  "What manufacturers are specified for Dedicated Outdoor-Air Units (DOAS)?",
  "Compare Packaged Rooftop Units vs Energy Recovery Units vs DOAS by total item count.",
  "BOD match vs mismatch rate across the dataset",
  "Which projects use the most Packaged Rooftop Units?",
  "Show me a pie chart of equipment share for the top 6 manufacturers.",
  "List the top 10 component types overall as a table.",
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
