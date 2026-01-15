# Implementation Plan - Advanced Workflow Customization

## Goal
1.  **Schema-Driven Params**: Define specific parameters (e.g., "Channel", "Message") for each integration.
2.  **Hybrid Input**: Allow users to set each parameter as either **Manual** (static text) or **AI Generated** (dynamic prompt executed at runtime).
3.  **Context-Aware Execution**: Pass results/status of previous nodes to the AI when executing the current node.

## Proposed Changes

### 1. Integration Schemas
- **File**: `src/lib/integrations.ts`
- **Change**: Add `fields` array to `Integration` interface.
  ```typescript
  interface IntegrationField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[]; // for select
    defaultMode: 'manual' | 'ai';
  }
  // Integration changes
  fields: IntegrationField[]
  ```

### 2. Node Data Structure (Config V2)
- **File**: `src/components/workflow/CustomNode.tsx` (Type Definition)
- **Structure**:
  ```typescript
  config: {
    [key: string]: {
      mode: 'manual' | 'ai';
      value: string; // The static value OR the prompt
    }
  }
  ```

### 3. Node Editor Upgrade
- **File**: `src/components/workflow/NodeEditor.tsx`
- **change**:
  - Dynamically render inputs based on `integration.fields`.
  - For each field, add a Toggle/Tab: [Manual | AI].
  - If Manual -> Simple Input.
  - If AI -> Textarea for "Prompt".

### 4. Execution Engine Logic
- **File**: `src/components/workflow/WorkflowBoard.tsx`
  - Maintain `executionResults` map: `{ [nodeId]: { status: 'success', output: "..." } }`.
  - Pass this map to `onRunNode`.
  
- **File**: `src/app/page.tsx` (`handleRunNode`)
  - **New Logic**:
    1. Check if any params are `mode: 'ai'`.
    2. If so, call AI API with: `Current Node Config` + `Previous Node Results`.
    3. AI resolves the dynamic parameters.
    4. (Mock) Execute the integration.
    5. Save result to `executionResults`.

### 5. API Update
- **File**: `src/app/api/chat/route.ts`
  - Ensure `WORKFLOW_PROMPT` (or a query prompt) instructs the AI to use the provided `executionContext` (previous results) when generating values.

## Verification
1.  Open Node Editor for "Slack" node.
2.  Set "Channel" to Manual: "#general".
3.  Set "Message" to AI: "Summarize the email result from node 1".
4.  Run Workflow.
5.  Observe logs/chat: Verification that AI received Node 1's output and generated the summary for Node 2.
