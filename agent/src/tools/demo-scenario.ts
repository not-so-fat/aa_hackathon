import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const DEMO_SCENARIOS: Record<string, { goal: string; instructions: string }> = {
  "hackathon-demo": {
    goal: "Write a secure authentication module in JavaScript. First research common vulnerabilities and best practices using Tavily, then write the code.",
    instructions:
      "First request Scoped Access (request_scoped_access) with allowed_domains: api.tavily.com. Then use tavily_search to research: (1) common auth vulnerabilities (OWASP), (2) secure password handling best practices, (3) latest security advisories for Node.js auth libraries. Summarize findings, then write secure code that avoids the vulnerabilities you found.",
  },
  "security-research": {
    goal: "Research security vulnerabilities and best practices for a coding task, then write secure code.",
    instructions: "Request Scoped Access if needed, then use tavily_search to find CVEs, security best practices, and recent advisories related to the user's task. Summarize findings and write code that follows secure patterns.",
  },
};

const demoScenarioSchema = z.object({
  name: z.enum(["hackathon-demo", "security-research"]).describe("Scenario name"),
});

export const setDemoScenarioTool = createTool({
  id: "set_demo_scenario",
  description:
    "Set a demo scenario: 'hackathon-demo' = security research before coding; 'security-research' = research vulnerabilities and write secure code.",
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
