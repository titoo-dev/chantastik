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

## React Hooks Testing Guidelines

### Testing Framework Setup

- Use Jest as the primary testing framework
- Utilize `@testing-library/react-hooks` for isolated hook testing
- Follow AAA pattern: Arrange, Act, Assert

### Hook Testing Best Practices

#### 1. Test Hook Behavior, Not Implementation

- Focus on what the hook returns and how it responds to inputs
- Avoid testing internal state changes unless they affect the public API
- Test the hook's contract, not its internal mechanics

#### 2. Use renderHook for Isolation

- Test hooks in isolation using `renderHook()` from react-hooks-testing-library
- Provide minimal props and context needed for the test
- Mock external dependencies and API calls

#### 3. Test State Updates and Side Effects

- Use `act()` wrapper for state updates and async operations
- Test initial state, state transitions, and final state
- Verify side effects like API calls, localStorage updates, or event listeners

#### 4. Async Hook Testing

- Use `waitForNextUpdate()` for async state changes
- Test loading states, success states, and error states
- Mock timers with `jest.useFakeTimers()` when testing delays

#### 5. Custom Hook Dependencies

- Mock hook dependencies using `jest.mock()`
- Test different dependency return values and error scenarios
- Verify cleanup functions are called on unmount

### Example Test Structure

## React Context to Zustand Migration Guidelines

### Migration Principles

When migrating from React Context to Zustand, follow these guidelines to ensure zero breaking changes:

#### 1. Preserve Context API Surface

- Keep existing Context providers and hooks functional during migration
- Create Zustand stores that mirror existing Context state structure
- Maintain the same state shape and property names
- Preserve all existing method signatures and return types

#### 2. Gradual Migration Strategy

- Implement Zustand store alongside existing Context
- Create adapter hooks that consume Zustand but maintain Context API
- Migrate components incrementally, not all at once
- Use feature flags to control migration rollout

#### 3. Backward Compatibility Layer

- Ensure Zustand store can be accessed via existing Context hooks
- Provide fallback logic in components that still use Context
- Allow components to switch between Context and Zustand without changes
- Maintain existing Context consumers until fully migrated
