import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const DEMO_SCENARIOS: Record<string, { goal: string; instructions: string }> = {
  "hackathon-demo": {
    goal: "Research the top 3 sponsor tools for AI agents at this hackathon. Store each finding in Neo4j and then summarize.",
    instructions:
      "First request Scoped Access (request_scoped_access) with allowed_domains including api.tavily.com and your Neo4j host. Then use tavily_search for 2-3 queries, store findings with neo4j_store_finding, then neo4j_query to read back and produce a short summary.",
  },
  research: {
    goal: "Research a topic the user provides; store findings in the knowledge graph and summarize.",
    instructions: "Request Scoped Access if needed, then search with Tavily, store findings in Neo4j, query and summarize.",
  },
};

const demoScenarioSchema = z.object({
  name: z.enum(["hackathon-demo", "research"]).describe("Scenario name"),
});

export const setDemoScenarioTool = createTool({
  id: "set_demo_scenario",
  description:
    "Set a demo scenario that defines a predefined goal and instructions. Use 'hackathon-demo' for the 3-minute sponsor research demo, or 'research' for generic research.",
  inputSchema: demoScenarioSchema,
  outputSchema: z.object({
    success: z.boolean(),
    goal: z.string().optional(),
    instructions: z.string().optional(),
    message: z.string().optional(),
  }),
  execute: async (inputData) => {
    const input = inputData as z.infer<typeof demoScenarioSchema>;
    const scenario = DEMO_SCENARIOS[input.name];
    if (!scenario) {
      return { success: false, message: `Unknown scenario: ${input.name}. Use hackathon-demo or research.` };
    }
    return {
      success: true,
      goal: scenario.goal,
      instructions: scenario.instructions,
      message: `Scenario '${input.name}' loaded. Goal: ${scenario.goal}`,
    };
  },
});
