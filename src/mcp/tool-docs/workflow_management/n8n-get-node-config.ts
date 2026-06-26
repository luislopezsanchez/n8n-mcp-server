import { ToolDocumentation } from '../types';

export const n8nGetNodeConfigDoc: ToolDocumentation = {
  name: 'n8n_get_node_config',
  category: 'workflow_management',
  essentials: {
    description: "Get a single node's full configuration from a workflow by node name. Returns parameters, type, position, and metadata without downloading the entire workflow. Much faster than n8n_get_workflow(mode='full') when you only need one node.",
    keyParameters: ['workflowId', 'nodeName'],
    example: 'n8n_get_node_config({workflowId: "abc123", nodeName: "Code Node"})',
    performance: 'Fast (~50-150ms, ~1-5KB response vs 130KB for full workflow)',
    tips: [
      "Use this instead of n8n_get_workflow(mode='full') when you only need one node's config",
      'Use the optional "fields" parameter to get only specific parameters (e.g., ["parameters.jsCode"])',
      'Returns nodeType, typeVersion, position, parameters, credentials, and notes',
      'If the node is not found, returns available node names in the error message'
    ]
  },
  full: {
    description: `**Single node retrieval.** Downloads the full workflow from n8n API and extracts only the requested node's configuration. This avoids the 130KB+ payload of n8n_get_workflow(mode="full") when you only need one node.

**When to use:**
- Reading a Code node's JavaScript before editing it
- Inspecting a specific node's parameters without downloading 40+ other nodes
- Checking credentials configuration on a single node
- Getting node position/typeVersion for diff operations

**When NOT to use:**
- When you need multiple nodes — use n8n_get_workflow with nodeFilter instead
- When you need the full workflow structure (connections, settings)`,
    parameters: {
      workflowId: { type: 'string', required: true, description: 'Workflow ID to retrieve the node from' },
      nodeName: { type: 'string', required: true, description: 'Name of the node to retrieve (e.g., "Integrar Ticket ID Alto"). Case-sensitive exact match.' },
      fields: { type: 'string[]', required: false, description: 'Optional: specific parameter fields to return (e.g., ["parameters.jsCode", "parameters.model"]). Supports dot-separated paths. If omitted, returns all parameters.' }
    },
    returns: `{
  success: true,
  data: {
    nodeName: string,
    nodeType: string (e.g., "n8n-nodes-base.code"),
    typeVersion: number,
    position: [number, number],
    disabled: boolean,
    parameters: object (filtered if "fields" provided),
    credentials?: object,
    notes?: string
  }
}

On error:
- Node not found: { success: false, error: "Node \\"X\\" not found. Available nodes: [...]" }
- Workflow not found: { success: false, error: "Not Found", code: "NOT_FOUND" }`,
    examples: [
      '// Get full config of a Code node\nn8n_get_node_config({workflowId: "OwoB4C92QZug7RZx", nodeName: "Integrar Ticket ID Alto"})',
      '// Get only the jsCode parameter\nn8n_get_node_config({workflowId: "OwoB4C92QZug7RZx", nodeName: "Integrar Ticket ID Alto", fields: ["parameters.jsCode"]})',
      '// Get multiple specific fields\nn8n_get_node_config({workflowId: "abc123", nodeName: "HTTP Request", fields: ["parameters.url", "parameters.method", "parameters.authentication"]})'
    ],
    useCases: [
      'Reading Code node JavaScript before editing with n8n_update_partial_workflow',
      "Inspecting a node's credentials configuration",
      'Checking typeVersion before creating a diff operation',
      'Debugging a specific node\'s parameters without downloading the full workflow',
      'Quick parameter inspection during workflow building'
    ],
    performance: `Response times:
- ~50-150ms total (workflow fetch + node extraction)
- Response size: ~1-5KB (vs 130KB+ for full workflow)
- Token savings: ~90-95% compared to n8n_get_workflow(mode="full")`,
    bestPractices: [
      'Use this before n8n_read_node_field if you need the full node context',
      'Use the "fields" parameter to minimize response size when you know what you need',
      'Combine with n8n_read_node_field: first get node config to see available fields, then read specific values',
      'Node names are case-sensitive — use exact names from n8n_get_workflow(mode="structure")'
    ],
    pitfalls: [
      'Requires N8N_API_URL and N8N_API_KEY configured',
      'Node name must match exactly (case-sensitive)',
      'Still downloads the full workflow internally (n8n API limitation), but only returns the requested node',
      'If the workflow has many nodes, the internal fetch may still take time even though response is small'
    ],
    relatedTools: ['n8n_get_workflow', 'n8n_read_node_field', 'n8n_update_partial_workflow', 'n8n_list_workflows']
  }
};
