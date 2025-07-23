# MulmoCast App i18n Improvement Guide

## Current Issues to Address

### 1. Translation Completeness
- **en.ts has untranslated items**: 
  - `menu.about`: "Abount" → "About"
  - `form.changeBeatTypeFirst`: Still in English in ja.ts
  - `project.generate.*`: All items still in English in ja.ts

### 2. Structure Improvements
The current structure should better reflect the actual component hierarchy:

```typescript
// Current (too flat)
project: {
  generate: { ... }
}

// Suggested (component-based)
project: {
  editor: {
    // script_editor.vue related
  },
  generate: {
    // generate.vue related
  },
  beats: {
    // beats_viewer.vue related
  },
  chat: {
    // chat.vue related
  },
  products: {
    // product_tabs.vue related
  }
}
```

## Recommended i18n Task Workflow

### 1. Analyze Component Structure
Before adding translations, understand the component's role:
- What feature does it implement?
- What other components does it interact with?
- Are there related translations already in the language files?

### 2. Group Related Translations
Keep translations that are used together in the same object:

```typescript
// Good: Grouped by feature
project: {
  editor: {
    title: "Script Editor",
    save: "Save",
    saveError: "Failed to save script",
    validation: {
      required: "This field is required",
      invalidFormat: "Invalid format"
    }
  }
}

// Bad: Scattered
project: {
  editorTitle: "Script Editor",
  save: "Save"
}
errors: {
  saveScript: "Failed to save script"
}
```

### 3. Handle Conditional Messages
For dynamic messages, use consistent patterns:

```typescript
// Component
const message = computed(() => 
  t(`project.status.${isActive.value ? 'active' : 'inactive'}`)
)

// Language file
project: {
  status: {
    active: "Active",
    inactive: "Inactive"
  }
}
```

### 4. Common Patterns in MulmoCast

#### Action Labels
```typescript
actions: {
  generate: "Generate",
  regenerate: "Regenerate", 
  forceRegenerate: "Force Regenerate",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete"
}
```

#### Status Messages
```typescript
status: {
  generating: "Generating...",
  completed: "Completed",
  failed: "Failed",
  processing: "Processing {current} of {total}"
}
```

#### Validation Messages
```typescript
validation: {
  required: "{field} is required",
  maxLength: "{field} must be less than {max} characters",
  invalidFormat: "Invalid {field} format"
}
```

## Implementation Checklist

When implementing i18n for a component:

1. **Scan for all text**:
   - [ ] Visible text in templates
   - [ ] aria-label attributes
   - [ ] title attributes
   - [ ] placeholder text
   - [ ] Error messages
   - [ ] Success messages
   - [ ] Loading states

2. **Check for existing translations**:
   - [ ] Search language files for similar text
   - [ ] Reuse existing translations where appropriate
   - [ ] Maintain consistency with existing naming

3. **Structure appropriately**:
   - [ ] Group by component/feature
   - [ ] Use nested objects for related items
   - [ ] Keep hierarchy shallow (max 3-4 levels)

4. **Test thoroughly**:
   - [ ] Switch languages to verify all text changes
   - [ ] Check text doesn't overflow UI elements
   - [ ] Verify placeholders and dynamic content

## Common Pitfalls to Avoid

1. **Don't hardcode language-specific formatting**:
   ```typescript
   // Bad
   const date = `${month}月${day}日`
   
   // Good - use i18n date formatting
   const date = d(new Date(), 'short')
   ```

2. **Don't concatenate translated strings**:
   ```typescript
   // Bad
   t('project.generate') + ' ' + t('common.contents')
   
   // Good
   t('project.generateContents')
   ```

3. **Don't forget pluralization**:
   ```typescript
   // Use vue-i18n's pluralization
   t('dashboard.project', projects.length)
   ```

## File Organization

### common.ts
Place here:
- Technical terms that don't translate (API, URL, JSON, etc.)
- Product names (MulmoCast, MulmoScript)
- Shared UI terms used across many components

### en.ts / ja.ts
- Feature-specific translations
- Component-specific text
- Error/success messages
- Form labels and placeholders

## Example Migration

Before:
```vue
<template>
  <h2>Script Editor</h2>
  <button @click="save">Save Script</button>
  <span v-if="error">Failed to save</span>
</template>
```

After:
```vue
<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <h2>{{ t('project.editor.title') }}</h2>
  <button @click="save">{{ t('project.editor.save') }}</button>
  <span v-if="error">{{ t('project.editor.saveError') }}</span>
</template>
```

Language file additions:
```typescript
// en.ts
project: {
  editor: {
    title: "Script Editor",
    save: "Save Script",
    saveError: "Failed to save"
  }
}

// ja.ts
project: {
  editor: {
    title: "スクリプトエディタ",
    save: "スクリプトを保存",
    saveError: "保存に失敗しました"
  }
}
```