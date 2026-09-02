# Encoding And Text Integrity Rules

Use these rules whenever creating or editing source code, Markdown, JSON, YAML, XML, SQL, or configuration files.

## Required Standard

- Write text files as UTF-8 unless the existing project explicitly requires a different encoding.
- Preserve the existing line ending style when practical.
- Do not introduce garbled text, replacement characters, or mojibake into comments, UI strings, logs, SQL, XML, Markdown, or configuration.
- When writing Korean user-facing text, write valid Korean text only when the intended wording is known.
- When the intended Korean wording is unclear, ask the user or keep a neutral English placeholder instead of inventing broken text.

## Mojibake Handling

Treat these as blockers before editing nearby text:

- Unicode replacement characters such as `U+FFFD`
- Escaped or visibly corrupted multibyte text
- Broken Korean-looking syllable sequences that do not form meaningful words
- Text that appears to be UTF-8 decoded as another legacy encoding
- Text that appears to be a legacy encoding decoded as UTF-8

If any of these appear:

1. Do not preserve or expand the corrupted text as if it were valid content.
2. Inspect file encoding and git history when available.
3. Ask for the intended wording when the original text cannot be recovered confidently.
4. Replace corrupted text only with verified wording.

## Editing Safety

- Prefer direct file patches for small edits.
- Avoid shell redirection, ad-hoc transcoding, or command output rewriting for files containing non-ASCII text.
- Do not use tools that silently convert encodings unless the conversion is the explicit task.
- Before bulk formatting or generation, confirm the formatter preserves UTF-8 text.
- After editing files that contain Korean or other non-ASCII text, search for replacement characters and obvious mojibake before finishing.

## Validation

Use targeted checks when relevant:

```bash
rg -n "\x{FFFD}" .
```

For generated UI copy, manually inspect the rendered screen or output when possible.
