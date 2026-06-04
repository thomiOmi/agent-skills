# AI Integration Templates

## Prompt Template

```text
[ROLE — optional]
You are a [role] with expertise in [domain].

[TASK]
[One clear sentence describing what to do.]

[CONTEXT]
{context_variable}

[CONSTRAINTS]
- [Constraint 1]
- [Constraint 2]
- Do not include information not present in the context above.

[OUTPUT FORMAT]
Respond with valid JSON only. No explanation. No markdown fences.

Required schema:
{
  "field_one": "string value",
  "field_two": 0,
  "field_three": ["string"]
}
```

---

## Retry Handler Structure (pseudocode)

```text
FUNCTION call_with_retry(request, max_retries = 3):

  FOR attempt FROM 0 TO max_retries - 1:
    TRY:
      RETURN call_api(request)

    ON rate_limit_error:
      wait = 2 ^ attempt
      log warning with attempt count and wait time
      sleep(wait)

    ON server_error (5xx):
      wait = 2 ^ attempt
      log warning with status code, attempt, wait
      sleep(wait)

    ON client_error (4xx):
      log error with status code
      RAISE immediately — do not retry

  RAISE "Max retries exhausted"
```

---

## RAG Prompt Template

```text
Answer the question using ONLY the information in the context below.
If the answer is not present, respond: "I do not have enough information."
Do not add outside information.

[CONTEXT]
Source: {source_name}
{retrieved_chunk}

[QUESTION]
{user_question}
```

---

## Tool Definition Template

```text
TOOL:
  name:        [snake_case_name]

  description: [What this tool does and when to use it.
               Be specific about the conditions for using it.
               The model selects this tool based on this description alone.]

  parameters:
    [required_param]:
      type:    string | integer | boolean | array | object
      description: [What this parameter represents]
      required: true

    [optional_param]:
      type:    integer
      description: [What this parameter represents]
      default: 5
      required: false
```
