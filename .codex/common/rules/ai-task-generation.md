# AI Task Generation

Read this when changing the goals AI service, response validation, generation hooks, or history exclusions.

## Contract

- Treat provider output and parsed JSON as unknown; validate before updating state.
- Accept only complete, unblocked responses and exactly the requested 1–3 tasks.
- Require nonempty titles and descriptions, finite numeric estimates of 5–30 minutes, and actual boolean repeatability. Do not coerce invalid fields.
- Reject the entire batch for invalid or duplicate tasks. Preserve existing tasks and refresh allowance on generation failure.
- Bound requests to 90 seconds; clear timers on every path. Use Korean recovery messages for network, HTTP, timeout and response failures.
- Do not expose raw provider errors or secrets. Do not silently retry paid requests.

## Duplicate Policy

- Within the same goal, exclude all tasks generated on the current local calendar day, complete or incomplete.
- Also exclude completed nonrepeatable tasks from previous days.
- Allow previous-day repeatable routines and keep goals independent.
- Apply the same exclusions to basic generation, additions and replacement.
- Ask the model to avoid semantic duplicates. Locally reject normalized title equality (Unicode normalization, case, whitespace, punctuation and symbols). This does not guarantee semantic deduplication.

## Verification

- Cover malformed, empty, blocked and truncated responses, missing fields, wrong counts, invalid types and time ranges, network and HTTP errors.
- Cover within-batch and historical duplicates, goal isolation and local midnight boundaries.
- Mock provider calls; normal verification must not spend API credits.
- Run `npx tsc --noEmit`.
- Compile tests: `npx tsc --ignoreConfig --target es2022 --module commonjs --moduleResolution node --ignoreDeprecations 6.0 --esModuleInterop --skipLibCheck --outDir .tmp-ai-tests src/features/goals/goalAi.test.ts`.
- Run `node --test .tmp-ai-tests/goalAi.test.js` and remove only that generated directory afterward.
- Calendar completion timestamps and retroactive editing are separate work.