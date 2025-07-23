# Vue Component i18n Task Template

## Task: Internationalize Vue Component

### Input Required
1. Component file path (e.g., `src/renderer/pages/project/components/script_editor.vue`)
2. Current language context (what translations already exist)

### Analysis Phase
1. **Read the component file** to identify:
   - All hardcoded text in templates
   - Text in attributes (aria-label, title, placeholder)
   - Error/success messages in script
   - Dynamic text generation

2. **Check existing translations** for:
   - Similar functionality in other components
   - Reusable common terms
   - Existing structure patterns

### Implementation Phase

#### Step 1: Add i18n setup to component
```vue
<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
```

#### Step 2: Determine translation structure
Based on component location and functionality, choose appropriate nesting:
- `project.{componentName}.{subfeature}`
- Reuse existing structures where logical

#### Step 3: Replace hardcoded text
- Simple text: `{{ t('key') }}`
- Conditional: `{{ t(condition ? 'key1' : 'key2') }}`
- With parameters: `{{ t('key', { param: value }) }}`

#### Step 4: Update language files

**en.ts additions:**
```typescript
project: {
  componentName: {
    title: "English Title",
    actions: {
      save: "Save",
      cancel: "Cancel"
    },
    messages: {
      success: "Operation successful",
      error: "Operation failed"
    }
  }
}
```

**ja.ts additions:**
```typescript
project: {
  componentName: {
    title: "日本語タイトル",
    actions: {
      save: "保存",
      cancel: "キャンセル"
    },
    messages: {
      success: "操作が成功しました",
      error: "操作が失敗しました"
    }
  }
}
```

### Validation Checklist
- [ ] All visible text is internationalized
- [ ] All attributes with text are internationalized
- [ ] Translation keys follow project conventions
- [ ] Both en.ts and ja.ts are updated
- [ ] No hardcoded language-specific formatting
- [ ] Component still functions correctly

### Output Format
1. **Modified component file** (complete file)
2. **en.ts additions** (just the new/modified sections)
3. **ja.ts additions** (just the new/modified sections)
4. **Brief explanation** of structure decisions

### Common Translation Patterns

#### Form Fields
```typescript
form: {
  label: "Field Label",
  placeholder: "Enter value...",
  helper: "Help text",
  error: {
    required: "This field is required",
    invalid: "Invalid value"
  }
}
```

#### Actions
```typescript
actions: {
  primary: "Main Action",
  secondary: "Secondary Action",
  cancel: "Cancel",
  confirm: "Confirm"
}
```

#### States
```typescript
state: {
  loading: "Loading...",
  empty: "No data",
  error: "An error occurred",
  success: "Success"
}
```

### Notes
- Prefer flat structures over deeply nested ones
- Group related translations together
- Reuse common translations from existing sections
- Consider text length differences between languages
- Always provide both English and Japanese translations