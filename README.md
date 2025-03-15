A fast, unstyled, and composable comment composer React component.

- 🎨 Unstyled and composable, use your own styles as you want.
- 🧩 Composable and clean API, compose it as you think.
- 🧠 Focused functionalities, use only features you want.

# Install

```sh
npm i konpo
```

# Usage

```tsx
import { Composer } from 'konpo'

export function CommentComposer() {
  return (
    <Composer.Root>
      <Composer.Editor />
      <Composer.SubmitButton />
    </Composer.Root>
  )
}
```
