---
description: "Complete i18n workflow management and project-wide internationalization"
args: 
  - name: "stage"
    required: false
    type: "string"
    description: "Workflow stage: 'audit' (assess current state), 'plan' (create implementation plan), 'execute' (run full implementation), or 'complete' (full workflow)"
    default: "complete"
  - name: "scope"
    required: false
    type: "string"
    description: "Project scope: 'ui' (UI components only), 'pages' (page components), 'all' (entire project)"
    default: "all"
---

# i18n Workflow Manager

Complete workflow management for MulmoCast app internationalization project.

## Usage
```
/i18n-workflow [stage] [scope]
```

## Examples
```
/i18n-workflow audit all           # Assess current i18n state across entire project
/i18n-workflow plan pages          # Create implementation plan for page components
/i18n-workflow execute ui          # Execute i18n for UI components only
/i18n-workflow complete all        # Full end-to-end workflow (default)
```

## Task Instructions

You will manage the i18n workflow for the specified stage ({stage}) and scope ({scope}).

### Progress Tracking Integration
All workflow executions will update the progress tracking sheet at `docs/i18n-progress-tracker.md`:
- **Automatic updates** for phase completion status
- **Timestamp recording** for each stage execution  
- **Results documentation** with statistics and findings
- **Issue tracking** for problems encountered during execution

### Progress Update Pattern
```markdown
1. Read current progress sheet: `docs/i18n-progress-tracker.md`
2. Update relevant phase status and timestamps
3. Record execution results and statistics
4. Document any issues or deviations from plan
5. Save updated progress sheet
```

## Workflow Stages

### Stage 1: "audit" - Current State Assessment
1. **Update progress sheet**: Mark Phase 1 as in-progress with timestamp
2. **Scan entire codebase** for i18n readiness
3. **Analyze existing translations** in en.ts, ja.ts, common.ts
4. **Identify gaps and issues**:
   - Components without i18n
   - Missing translations
   - Inconsistent key structures
   - Hardcoded text remaining
5. **Generate project status report** and save as `docs/i18n-audit-YYYYMMDD.md`
6. **Update progress sheet**: Record audit results, statistics, and mark Phase 1 complete

### Stage 2: "plan" - Implementation Planning
1. **Update progress sheet**: Mark Phase 2 as in-progress with timestamp
2. **Prioritize components** by complexity and importance
3. **Create implementation timeline**
4. **Identify dependencies** between components
5. **Plan translation key structure** 
6. **Estimate effort and potential issues**
7. **Generate implementation plan** and save as `docs/i18n-plan-YYYYMMDD.md`
8. **Update progress sheet**: Record priority assignments, estimates, and mark Phase 2 complete

### Stage 3: "execute" - Implementation
1. **Update progress sheet**: Mark Phase 3 as in-progress with timestamp
2. **Run refactor** on existing i18n structure (if needed)
   - Update progress sheet with refactor results
3. **Batch process components** in priority order
   - Update individual component status in progress sheet
4. **Update language files** systematically
   - Track translation key additions
5. **Validate implementation** after each batch
6. **Update progress sheet**: Record implementation statistics and mark Phase 3 complete

### Stage 4: "complete" - Full Workflow (Default)
1. **Initialize progress sheet**: Update project overview with start time and target
2. **Run all stages sequentially** (audit → plan → execute) with human checkpoints
3. **Final validation**: 
   - Update progress sheet with final statistics
   - Mark all phases complete
   - Record total time and efficiency metrics
   - Generate completion summary

## Scope Definitions

### "ui" - UI Components Only
- `src/renderer/components/ui/**/*.vue`
- Focus on reusable UI elements
- High impact, lower complexity

### "pages" - Page Components
- `src/renderer/pages/**/*.vue`
- Application-specific functionality
- Higher complexity, varied text content

### "all" - Entire Project (Default)
- All Vue components in the project
- Complete internationalization
- Includes both UI and page components

## Execution Flow

### For "complete" stage:

#### Phase 1: Assessment & Planning (Human Checkpoint)
```markdown
# i18n Project Assessment

## Current State  
- Total components: X
- Components with i18n: Y (Z%)
- Missing translations: A
- Structure issues: B

## Implementation Plan
### Priority 1: Critical Components (Est: 2-3 hours)
- dashboard.vue - Main navigation
- project.vue - Core functionality
- script_editor.vue - Primary workflow

### Priority 2: UI Components (Est: 1-2 hours)  
- Button, Input, Dialog components
- Form validation components

### Priority 3: Supporting Components (Est: 1 hour)
- Utility and helper components

**Progress sheet updated with assessment results**
**Proceed with implementation? [Y/N]**
```

#### Phase 2: Structure Refactoring (If Needed)
- Run `/i18n-refactor all` to fix existing structure
- Consolidate duplicate translations
- Standardize key naming
- **Update progress sheet** with refactoring results

#### Phase 3: Batch Implementation
- Process components in priority order
- **Update component status in progress sheet** as each is completed
- Human review after each priority group
- Continuous validation and testing

#### Phase 4: Final Validation
- Complete translation coverage check
- Cross-language consistency validation
- Performance impact assessment
- **Update progress sheet** with final completion statistics and summary

## Safety & Quality Controls

### Pre-execution Checks
- [ ] Git working directory is clean
- [ ] Current branch backed up
- [ ] No pending language file conflicts
- [ ] Development server is running for testing
- [ ] Progress tracking sheet `docs/i18n-progress-tracker.md` is accessible

### Progress Tracking  
- **Real-time updates** to `docs/i18n-progress-tracker.md`
- **Component completion status** with timestamps
- **Translation key addition counters** for each language file
- **Error and warning logs** in the issues section
- **Time tracking** with actual vs estimated comparisons

### Quality Validation
- **Key naming consistency** across all components
- **Translation completeness** (en.ts ↔ ja.ts parity)
- **No hardcoded strings** remaining
- **Component functionality** preserved

### Rollback Plan
- Component-level rollback capability
- Language file version restoration
- Conflict resolution guidance

## Output Reports

### Audit Report
- Current i18n coverage percentage
- Priority component rankings
- Identified issues and recommendations
- Implementation effort estimates

### Progress Report
- Components completed/remaining
- Translation statistics
- Time spent vs. estimated
- Issues encountered and resolved

### Completion Report
- Final coverage statistics
- Performance impact summary
- Maintenance recommendations
- Future enhancement suggestions

This workflow manager ensures systematic, safe, and complete internationalization of the MulmoCast application.