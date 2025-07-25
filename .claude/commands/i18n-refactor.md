---
description: "Comprehensive refactoring and improvement of the existing i18n structure"
args: 
  - name: "scope"
    required: false
    type: "string"
    description: "Scope of improvement: 'structure' (reorganize), 'translations' (fix missing), or 'all' (both)"
    default: "all"
---

# MulmoCast App i18n Refactor

Comprehensive refactoring and improvement of the existing i18n structure to fix translation gaps and improve organization.

## Usage
```
/i18n-refactor [scope]
```

## Examples
```
/i18n-refactor structure    # Only reorganize structure
/i18n-refactor translations # Only fix missing translations  
/i18n-refactor all         # Both structure and translations (default)
```

## Task Instructions

You will improve the MulmoCast app's i18n implementation based on the specified scope ({scope}).

## Current Issues to Address

### 1. Translation Completeness
- **en.ts has untranslated items**: 
  - `menu.about`: "Abount" → "About"
  - `form.changeBeatTypeFirst`: Still in English in ja.ts
  - `project.generate.*`: All items still in English in ja.ts

### 2. Structure Improvements
The current structure should follow the new final structure with shared UI elements and role-based key separation:

```typescript
// Current (distributed)
form: { cancel: "Cancel" }
project: { generate: { ... } }
beat: { badge: { ... }, form: { ... } }

// New Structure (shared UI + role-based keys)
ui: {
  common: {
    title: "Title", image: "Image", // shared nouns
  },
  actions: {
    add: "Add",              // placeholder-free
    addThing: "Add {thing}", // with placeholder
    cancel: "Cancel",
    generate: "Generate",
    generateThing: "Generate {thing}",
  },
  status: {
    loading: "Loading...", generating: "Generating...",
  }
},
beat: {
  textSlide: { titleField: ui.common.title }, // reference ui.common
  actions: { changeBeatTypeFirst: "Change beat type first" }
},
parameters: { movieParams: { title: "Movie Parameters" } },
chat: { title: "AI Assistant Chat" },
generate: { settingsTitle: "Output Settings & Generation" }
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

#### Action Labels (Role-based Key Separation)
```typescript
ui: {
  actions: {
    // Placeholder-free actions (standalone verbs)
    generate: "Generate",
    cancel: "Cancel", 
    save: "Save",
    delete: "Delete",
    
    // Placeholder actions (with target object)
    generateThing: "Generate {thing}",
    deleteThing: "Delete {thing}",
    
    // Usage examples:
    // t('ui.actions.generate') → "Generate"
    // t('ui.actions.generateThing', { thing: 'Image' }) → "Generate Image"
  }
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
   // Bad - String concatenation breaks i18n
   t('ui.actions.add') + ' ' + t('ui.common.beat')
   
   // Good - Use placeholder pattern
   t('ui.actions.addThing', { thing: t('ui.common.beat') })
   // Results: EN "Add Beat" / JA "ビートを追加"
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

After (New Final Structure):
```vue
<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <h2>{{ t('ui.common.title') }}</h2>
  <button @click="save">{{ t('ui.actions.saveThing', { thing: 'Script' }) }}</button>
  <span v-if="error">{{ t('ui.status.error') }}</span>
</template>
```

Language file additions:
```typescript
// en.ts
ui: {
  common: {
    title: "Title", // reusable across components
  },
  actions: {
    save: "Save",
    saveThing: "Save {thing}", // placeholder pattern
  },
  status: {
    error: "Error occurred",
  }
}

// ja.ts  
ui: {
  common: {
    title: "タイトル",
  },
  actions: {
    save: "保存",
    saveThing: "{thing}を保存", // natural Japanese word order
  },
  status: {
    error: "エラーが発生しました",
  }
}
```