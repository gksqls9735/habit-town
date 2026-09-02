# Function Comment Rules

Use comments to explain intent and business purpose, not obvious implementation details.


## Required Comments

Add comments for:

- Exported functions
- API calls
- Business logic
- Event handlers
- Custom hooks


## Writing Standard

Comments should:

- Describe what the function is responsible for
- Avoid restating the function name
- Avoid describing obvious implementation steps
- Stay valid even if the implementation changes


Good:

```ts
/**
 * Loads the user's profile information for the account screen.
 */
```

Bad:

```ts
/**
 * API call.
 */
```

```ts
/**
 * Runs axios.get.
 */
```

## Optional Comments

Comments may be skipped for:

- `open`
- `close`
- `toggle`
- Simple calculations
- Simple state updates

