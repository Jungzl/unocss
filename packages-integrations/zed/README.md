# UnoCSS for Zed

The instant on-demand Atomic CSS engine, now available for Zed!

## Installation

### From Zed Extensions (Once Published)

1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Run "zed: extensions"
3. Search for "UnoCSS" and click Install

### As Dev Extension (For Development)

**Note:** This extension requires `@unocss/language-server` to be published to npm before it can be used by others. For local development, you need to have the language-server built in the monorepo.

1. Clone the UnoCSS repository
2. Build the language-server: `cd packages-integrations/language-server && pnpm build`
3. Open Zed and run "zed: install dev extension" from Command Palette
4. Select `packages-integrations/zed/` directory

## Features

- **Autocomplete**: Intelligent suggestions for UnoCSS utility classes
- **Hover Documentation**: See generated CSS on hover with rem-to-px conversion
- **Color Preview**: Visual color picker for color utilities
- **References**: Find all usages of utility classes
- **Multi-Framework**: Works with Vue, React, Svelte, Astro, and more

## Configuration

Configure UnoCSS settings in your Zed `settings.json`:

```json
{
  "lsp": {
    "unocss": {
      "remToPxRatio": 16,
      "autocomplete": {
        "matchType": "prefix",
        "maxItems": 1000
      }
    }
  }
}
```

### Available Settings

- `remToPxRatio` (number, default: 16): Ratio for rem-to-px conversion
- `autocomplete.matchType` ("prefix" | "fuzzy", default: "prefix"): Matching strategy
- `autocomplete.strict` (boolean, default: false): Strict autocomplete mode
- `autocomplete.maxItems` (number, default: 1000): Maximum completion items

## Requirements

- A UnoCSS configuration file (`uno.config.ts` or similar)
- Node.js is provided by Zed automatically

**Note:** The extension automatically installs the latest version of `@unocss/language-server` from npm. No version management is required.

## Supported File Types

- JavaScript, TypeScript, JSX, TSX
- Vue, Svelte, Astro
- HTML, CSS, SCSS, Less
- Markdown

## Troubleshooting

### Language Server Not Starting

Check Zed's LSP logs:

1. View > Debug > Open Log File
2. Look for "UnoCSS Language Server" messages

### Completions Not Showing

Ensure you have a UnoCSS config file in your project root or a parent directory.

## Links

- [UnoCSS Documentation](https://unocss.dev)
- [Report Issues](https://github.com/unocss/unocss/issues)
- [Language Server Source](https://github.com/unocss/unocss/tree/main/packages-integrations/language-server)
