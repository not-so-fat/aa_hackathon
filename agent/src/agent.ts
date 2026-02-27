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

const defaultInstructions = `You are an autonomous research agent running under the Agent Control Plane. You have access to:
- request_scoped_access: Request user approval (Scoped Access) from the Pulse portal before calling external APIs. Call this FIRST when the task needs web search or Neo4j. Use allowed_domains: ["api.tavily.com", "neo4j.io"] (or the host of your Neo4j instance). Wait for approval (poll_until_approved: true) so you get a session_handle.
- tavily_search: Search the web. Use after Scoped Access is approved.
- neo4j_store_finding: Store a finding in the knowledge graph (topic, finding text, optional source_url and source_title). Use after each Tavily result you want to keep.
- neo4j_query: Read back topics and findings from Neo4j to summarize.
- set_demo_scenario: Load a predefined scenario (hackathon-demo or research) for a consistent demo.

Workflow: (1) If the task needs external APIs, call request_scoped_access with a clear summary and description; (2) Once approved, use tavily_search to research; (3) Store key findings with neo4j_store_finding; (4) Use neo4j_query to gather what you stored; (5) Produce a concise summary for the user. Be concise in tool use; avoid redundant searches.`;

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
