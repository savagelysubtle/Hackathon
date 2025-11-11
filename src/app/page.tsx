"use client";

import { ChatInterface } from "@/components/chat";
import { useCopilotAction } from "@copilotkit/react-core";
import { WeatherCard } from "@/components/weather";
import { MoonCard } from "@/components/moon";

export default function CopilotKitPage() {
  //🪁 Generative UI: https://docs.copilotkit.ai/pydantic-ai/generative-ui
  useCopilotAction({
    name: "get_weather",
    description: "Get the weather for a given location.",
    available: "disabled",
    parameters: [
      { name: "location", type: "string", required: true },
    ],
    render: ({ args }) => {
      return <WeatherCard location={args.location} themeColor="#65a30d" />
    },
  });

  // 🪁 Human In the Loop: https://docs.copilotkit.ai/pydantic-ai/human-in-the-loop
  useCopilotAction({
    name: "go_to_moon",
    description: "Go to the moon on request.",
    renderAndWaitForResponse: ({ respond, status}) => {
      return <MoonCard themeColor="#65a30d" status={status} respond={respond} />
    },
  });

  return (
    <main className="h-screen">
      <ChatInterface />
    </main>
  );
}
