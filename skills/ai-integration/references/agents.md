# Agents and Tool Use

Use an agent when the task requires multiple steps, decisions, or external data
that cannot all be anticipated in a single prompt.

---

## Agent vs Single Prompt

|Use a single prompt when|Use an agent when|
|--------------------------|-------------------|
|One clear input produces one clear output|The task requires multiple steps with branching decisions|
|All context fits in one message|The task needs to call external APIs, databases, or tools|
|The output format is deterministic|The model needs to observe a result and decide the next step|
|No external data is needed|The task involves iteration or self-correction|

When in doubt, start with a single prompt. Add agent complexity only when it is necessary.

---

## Tool Definition

A tool gives the agent the ability to perform a specific action or retrieve specific data.

```text
TOOL DEFINITION:

  name:         [tool_name]
                Must be unique. Use snake_case. Be specific.

  description:  [What this tool does and when to use it.]
                The model selects tools based solely on this description.
                Be explicit about the conditions under which this tool should be called.
                A vague description leads to incorrect tool selection.

  parameters:
    [parameter_name]:
      type:        [string | integer | boolean | array | object]
      description: [What this parameter represents and how to format it]
      required:    [true | false]
```

---

## Agent Execution Pattern

```text
LOOP (max iterations: [set a limit]):

  1. Provide the model with the task, context, and available tool definitions.
  2. Model returns either:
     a. A tool call — execute the tool, capture the result.
     b. A final answer — return the answer and exit the loop.
  3. Append the tool call and its result to the conversation.
  4. Return to step 1 with the updated conversation.

IF max iterations reached WITHOUT a final answer:
  Return a fallback response. Do not loop indefinitely.
```

---

## Rules

- Write tool descriptions as if explaining to a new colleague when to use the tool.
- Set a maximum iteration limit on every agent loop — prevent infinite loops.
- Log every tool call and its result for debugging.
- Validate tool call inputs before executing them — treat them as untrusted input.
- Do not give agents access to destructive operations (delete, send, publish) without a confirmation step.
- Do not use agents for tasks a single prompt can handle — agents add latency and cost.
