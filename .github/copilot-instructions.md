# GitHub Copilot Instructions

## Code Refactoring Guidelines

When refactoring code, always follow these principles to prevent breaking changes:

### 1. Preserve Public APIs

- Never change function signatures, method names, or class names that are exported or used externally
- Keep existing parameter types and return types intact
- Add new optional parameters only at the end of parameter lists
- Use function overloads instead of changing existing signatures

### 2. Maintain Backward Compatibility

- When adding new features, ensure old usage patterns continue to work
- Use deprecation warnings instead of immediate removal
- Provide migration paths for any necessary API changes
- Keep existing configuration options functional

### 3. Safe Refactoring Practices

- Extract methods/functions without changing their behavior
- Rename only private/internal variables and methods
- Move code between files only if it doesn't affect imports/exports
- Always preserve the original functionality and output

### 4. Testing Requirements

- Maintain all existing tests and ensure they pass
- Add new tests for refactored code paths
- Verify that no existing functionality is broken
- Test edge cases and error conditions

### 5. Documentation Updates

- Update inline comments to reflect code changes
- Keep README and API documentation current
- Document any new parameters or return values
- Note any deprecations clearly

Remember: Refactoring should improve code quality without changing external behavior.
