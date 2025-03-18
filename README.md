A fast, unstyled, and composable composer React component.

- 🎨 Unstyled, use your own styles as you want.
- 🧩 Composable and clean API, compose it as you think it.
- 🧠 Focused functionalities, use only features you want.

# Install

```sh
npm i konpo
```

# Usage

```tsx
import { Composer } from 'konpo'

export function ComposableComposer() {
  return (
    <Composer.Root>
      <Composer.Editor />
      <Composer.FloatingToolbar>
        <Composer.ToggleMarkTrigger>
          <BoldIcon />
        </Composer.ToggleMarkTrigger>
      </Composer.FloatingToolbar>
      <Composer.SubmitTrigger />
    </Composer.Root>
  )
}
```
