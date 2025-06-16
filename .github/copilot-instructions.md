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

## Lyrics Theme Generation Guidelines

### Display Principles

When generating lyrics themes for karaoke applications, follow these guidelines for optimal readability and performance:

#### 1. Lyrics Line Display Rules

- Display only the current active lyrics line prominently
- Show a subtle preview of the next upcoming line
- Never display previous lyrics lines to avoid clutter
- Ensure current line has maximum visual prominence and contrast\*
- Avoid adding decorative accents

#### 2. Text Spacing and Readability

- Maximize line spacing between current and next lyrics lines
- Use generous padding around text elements for breathing room
- Ensure minimum 2x line-height spacing between lyrics lines
- Maintain consistent horizontal spacing for text alignment

#### 3. Animation and Effects Constraints

- Respect user's animation preferences (prefers-reduced-motion)
- Use minimal particle effects to maintain 60fps performance
- Limit particle count to maximum 10-15 elements on screen
- Prefer CSS transforms over layout-triggering animations
- Use will-change property sparingly and remove after animations

#### 4. Visual Hierarchy Requirements

- Current line: High contrast, larger font size, bold weight
- Next line: Lower opacity (30-50%), smaller font, lighter weight
- Avoid competing visual elements that distract from lyrics
- Use subtle color coding rather than flashy effects

#### 5. Performance Optimization

- Debounce animation triggers to prevent excessive re-renders
- Use requestAnimationFrame for smooth animation timing
- Implement virtual scrolling for long song lyrics
- Clean up animation listeners and intervals on component unmount
- Avoid expensive CSS filters and shadows on animated elements

#### 6. Accessibility Considerations

- Maintain WCAG AA contrast ratios for all text
- Provide option to disable all animations
- Ensure text remains readable across different screen sizes
- Support keyboard navigation for lyrics timing controls

Remember: Lyrics themes should enhance the karaoke experience without overwhelming the user or degrading performance.

## Mobile-First Design Integration Guidelines

### Factory Pattern for Mobile Adaptation

When implementing mobile versions of existing components, use the Factory pattern to create device-specific implementations while maintaining a consistent interface:

#### 1. Component Factory Structure

- Create a factory function that returns the appropriate component based on device type
- Maintain identical props interface between desktop and mobile versions
- Use device detection or responsive breakpoints to determine component variant
- Implement fallback logic for unsupported devices or edge cases

#### 2. Mobile Component Requirements

- Design mobile-first, then enhance for larger screens
- Optimize touch interactions with minimum 44px touch targets
- Reduce cognitive load with simplified navigation patterns
- Prioritize essential features and progressive disclosure
- Adapt text size and spacing for readability on smaller screens
- Adapt icon sizes and button placements for touch interaction

#### 3. Responsive Factory Implementation

- Use CSS media queries in conjunction with component factories
- Implement lazy loading for mobile-specific component bundles
- Create shared base classes/hooks for common functionality
- Maintain performance budgets specific to mobile constraints

#### 4. Mobile Performance Optimization

- Limit bundle size for mobile-specific components
- Implement virtual scrolling for long lists on mobile
- Use intersection observers for lazy loading images and content
- Optimize animations for mobile hardware limitations (prefer transforms)

#### 5. Mobile UX Patterns

- Implement swipe gestures using touch event handlers
- Design for one-handed usage with bottom navigation
- Use native mobile patterns (bottom sheets, pull-to-refresh)
- Ensure proper keyboard handling for mobile text inputs

#### 6. Testing Mobile Components

- Test on real devices across different screen sizes
- Verify touch interactions and gesture handling
- Test performance on low-end mobile devices
- Validate accessibility with mobile screen readers

### Example Factory Pattern Structure
