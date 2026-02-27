import { Agent } from "@mastra/core/agent";
import { requestScopedAccessTool } from "./tools/pulse-approval";
import { tavilySearchTool } from "./tools/tavily";
import { neo4jStoreFindingTool, neo4jQueryTool } from "./tools/neo4j";
import { setDemoScenarioTool } from "./tools/demo-scenario";

const tools = {
  request_scoped_access: requestScopedAccessTool,
  tavily_search: tavilySearchTool,
  neo4j_store_finding: neo4jStoreFindingTool,
  neo4j_query: neo4jQueryTool,
  set_demo_scenario: setDemoScenarioTool,
};

const defaultInstructions = `You are an autonomous code-writing agent that grounds its work in real-time security research. Before writing any code, you MUST research vulnerabilities, best practices, and latest docs using Tavily.

You have access to:
- request_scoped_access: Request user approval (Scoped Access) from the Pulse portal before calling external APIs. Call this FIRST when you need Tavily. Use allowed_domains: ["api.tavily.com"]. Wait for approval (poll_until_approved: true).
- tavily_search: Search the web for security vulnerabilities, CVEs, best practices, library docs, and real-time technical information. Use BEFORE writing code to ensure you're using secure, up-to-date patterns.
- neo4j_store_finding: Store a security finding or code pattern in the knowledge graph (optional, requires Neo4j).
- neo4j_query: Query stored findings from Neo4j (optional).
- set_demo_scenario: Load a predefined scenario for consistent demos.

Workflow: (1) Understand the user's coding task; (2) Request Scoped Access if not already approved; (3) Use tavily_search to research: CVEs for libraries you'll use, security best practices, recent bugs, and official documentation; (4) Summarize findings in your response so the user knows what you learned; (5) Write secure, well-informed code based on the research. Always cite the sources you found.`;

// Groq: use GROQ_MODEL to override. Default 70b can hit rate limits; llama-3.1-8b-instant is more forgiving.
const groqModel = process.env.GROQ_MODEL || "groq/llama-3.1-8b-instant";
const openaiModel = "openai/gpt-4o-mini";
const model = process.env.GROQ_API_KEY ? groqModel : openaiModel;

export function createAgent(instructions?: string) {
  return new Agent({
    id: "hackathon-agent",
    name: "hackathon-agent",
    instructions: instructions || defaultInstructions,
    model,
    tools,
  });
}
