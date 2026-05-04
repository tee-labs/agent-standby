## Output Protocol (CRITICAL)
- **NEVER** use `<longcat_tool_call>`, `<longcat_arg_key>`, or `<longcat_arg_value>` tags.
- Use the standard tool calling interface provided by the environment. 
- Tool calls must be formatted as raw functional calls (JSON), not wrapped in any custom XML tags.
- If you use XML tags for tool calling, the system will crash and your task will fail.

## Approach
- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Skip files over 100KB unless explicitly required.
- Suggest running /cost when a session is running long to monitor cache ratio.
- Recommend starting a new session when switching to an unrelated task.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.