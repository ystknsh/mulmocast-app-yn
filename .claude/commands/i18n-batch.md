---
description: "Batch process i18n implementation for multiple Vue components"
args: 
  - name: "component_pattern"
    required: true
    type: "string"
    description: "Glob pattern for components (e.g., 'src/renderer/pages/project/components/*.vue')"
  - name: "action"
    required: false
    type: "string"
    description: "Action to perform: 'scan' (extract only), 'implement' (full i18n), or 'both' (scan then implement)"
    default: "both"
---

# i18n Batch Processing

Process multiple Vue components for internationalization in batch mode.

## Usage
```
/i18n-batch <component_pattern> [action]
```

## Examples
```
/i18n-batch "src/renderer/pages/project/components/*.vue" scan      # Extract from all project components
/i18n-batch "src/renderer/components/ui/**/*.vue" implement        # Implement i18n for all UI components
/i18n-batch "src/renderer/pages/**/*.vue" both                     # Full workflow for all pages
```

## Task Instructions

You will process multiple Vue components matching the pattern ({component_pattern}) with the specified action ({action}).

### Workflow by Action:

#### Action: "scan"
1. Find all components matching the pattern
2. For each component, run i18n text extraction
3. Consolidate all extracted texts into a summary report
4. Provide prioritized list for human review

#### Action: "implement" 
1. Find all components matching the pattern
2. For each component, implement full i18n
3. Update language files (en.ts, ja.ts, common.ts)
4. Provide summary of all changes

#### Action: "both" (default)
1. First run "scan" phase for all components
2. Present consolidated extraction report
3. Ask for human confirmation on common.ts candidates
4. Then run "implement" phase for all components
5. Provide final summary of all changes

### Processing Order
Components will be processed in this priority order:
1. **Core UI components** (`src/renderer/components/ui/`)
2. **Page components** (`src/renderer/pages/`)
3. **Shared components** (`src/renderer/components/`)

### Output Format

#### For "scan" action:
```markdown
# i18n Batch Scan Results

## Summary
- Components processed: X
- Total texts found: Y
- Common.ts candidates: Z

## By Component

### src/renderer/pages/project/components/script_editor.vue
[Individual scan results...]

### src/renderer/pages/project/components/generate.vue
[Individual scan results...]

## Consolidated Common.ts Candidates
**Human review required for:**
- [ ] "MulmoScript" (found in 3 components)
- [ ] "GraphAI" (found in 2 components)
- [ ] "OpenAI" (found in 1 component)

## Priority Recommendations
1. High: Components with many hardcoded strings
2. Medium: Components with form validation
3. Low: Components with minimal text
```

#### For "implement" action:
```markdown
# i18n Batch Implementation Results

## Summary
- Components processed: X
- Language keys added: Y (en.ts: A, ja.ts: B)
- Common.ts entries added: Z

## Files Modified
- [List of all modified component files]
- src/renderer/i18n/en.ts
- src/renderer/i18n/ja.ts
- src/renderer/i18n/common.ts (if applicable)

## Implementation Notes
[Any issues or special considerations]
```

### Safety Features
- **Dry run option**: Shows what would be changed without modifying files
- **Backup reminder**: Reminds to commit changes before large batch operations
- **Conflict detection**: Identifies translation key conflicts before implementation
- **Progress tracking**: Shows completion status for large batches

### Error Handling
- Skip components that are already fully internationalized
- Report components that have parse errors
- Continue processing even if individual components fail
- Provide detailed error log for failed components

### Best Practices Applied
- Consistent key naming across all components
- Reuse existing translations where possible
- Group related translations logically
- Maintain component hierarchy in translation structure
- Preserve Vue 3 Composition API patterns

This command streamlines the i18n process for multiple components while maintaining quality and consistency.