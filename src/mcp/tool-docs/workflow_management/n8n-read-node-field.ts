import { ToolDocumentation } from '../types';

export const n8nReadNodeFieldDoc: ToolDocumentation = {
  name: 'n8n_read_node_field',
  category: 'workflow_management',
  essentials: {
    description: "Read the current value of a specific field from a workflow node without downloading the full workflow. Use this to inspect a field before editing it with n8n_update_partial_workflow (patchNodeField).",
    keyParameters: ['workflowId', 'nodeName', 'fieldPath'],
    example: 'n8n_read_node_field({workflowId: "abc123", nodeName: "Code Node", fieldPath: "parameters.jsCode"})',
    performance: 'Fast (~50-150ms, returns just the field value)',
    tips: [
      'Use this BEFORE patchNodeField to see the current value you are about to edit',
      'fieldPath uses dot notation (e.g., "parameters.jsCode", "parameters.model")',
      'Returns the value, its type, and length (for strings)',
      'If the field or node is not found, returns a clear error with available keys'
    ]
  },
  full: {
    description: `**Read-only field inspection.** Fetches the workflow from n8n API and traverses the dot-separated fieldPath to return the exact current value. Designed as the read counterpart to patchNodeField's write capability.

**Typical workflow:**
1. n8n_read_node_field to see current value
2. n8n_update_partial_workflow with patchNodeField to edit it
3. n8n_read_node_field again to verify the change

**This is NOT patchNodeField with mode="read"** — it is a separate, dedicated tool. patchNodeField only supports write operations (find/replace patches).`,
    parameters: {
      workflowId: { type: 'string', required: true, description: 'Workflow ID' },
      nodeName: { type: 'string', required: true, description: 'Name of the node (e.g., "Integrar Ticket ID Alto"). Case-sensitive exact match.' },
      fieldPath: { type: 'string', required: true, description: 'Dot-separated path to the field (e.g., "parameters.jsCode", "parameters.model", "position.0")' }
    },
    returns: `{
  success: true,
  data: {
    nodeName: string,
    fieldPath: string,
    value: any (the current value at that path),
    type: string (typeof value),
    length?: number (only for string values)
  }
}

On error:
- Node not found: { success: false, error: "Node \\"X\\" not found. Available nodes: [...]" }
- Field not found: { success: false, error: "Field \\"X\\" not found on node \\"Y\\". Available top-level keys: [...]" }
- Invalid path: { success: false, error: "Cannot traverse \\"X\\": \\"Y\\" does not exist on ..." }`,
    examples: [
      '// Read a Code node\'s JavaScript before editing\nn8n_read_node_field({workflowId: "OwoB4C92QZug7RZx", nodeName: "Integrar Ticket ID Alto", fieldPath: "parameters.jsCode"})',
      '// Check a node\'s typeVersion\nn8n_read_node_field({workflowId: "abc123", nodeName: "HTTP Request", fieldPath: "typeVersion"})',
      '// Read a nested parameter\nn8n_read_node_field({workflowId: "abc123", nodeName: "Slack", fieldPath: "parameters.channelId"})'
    ],
    useCases: [
      'Reading current field value before editing with patchNodeField',
      'Verifying a change was applied correctly (read after patchNodeField)',
      'Checking typeVersion before creating updateNode operations',
      'Inspecting credentials configuration on a specific node',
      'Debugging: "what is the current value of this field?"'
    ],
    performance: `Response times:
- ~50-150ms total (workflow fetch + field traversal)
- Response size: minimal (just the field value + metadata)
- Much faster than downloading the full workflow`,
    bestPractices: [
      'Always read before writing: use n8n_read_node_field to see current value, then patchNodeField to edit',
      'Use n8n_get_node_config first if you need to discover available field paths',
      'Verify edits: read the field again after applying patchNodeField',
      'fieldPath supports deep nesting (e.g., "parameters.assignments.assignments.0.value")'
    ],
    pitfalls: [
      'Requires N8N_API_URL and N8N_API_KEY configured',
      'Node name must match exactly (case-sensitive)',
      'This is a READ-ONLY tool — to edit values, use n8n_update_partial_workflow with patchNodeField',
      'patchNodeField does NOT have a mode="read" — use this tool instead',
      'Still downloads the full workflow internally (n8n API limitation)'
    ],
    relatedTools: ['n8n_get_node_config', 'n8n_get_workflow', 'n8n_update_partial_workflow']
  }
};
