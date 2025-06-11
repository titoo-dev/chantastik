# Onboarding Tour Implementation

This directory contains a comprehensive onboarding walkthrough system built with React Joyride for the Karaoke Milay application.

## Features

- 🎯 **Interactive Tour**: Step-by-step guided tour of key application features
- 🎨 **Beautiful UI**: Custom styled tooltips matching the app's design system
- 📱 **Responsive**: Works seamlessly across desktop and mobile devices
- 🌙 **Theme Support**: Automatically adapts to light/dark themes
- 💾 **Progress Tracking**: Remembers completion status using localStorage
- 🔄 **Auto-start**: New users automatically see the tour
- 📋 **Help Access**: Easy restart via help button in header

## Components

### Core Components

- **`OnboardingTour`** - Main tour component using React Joyride
- **`OnboardingHelpButton`** - Dropdown menu for starting/restarting tours
- **`OnboardingAutoStart`** - Auto-starts tour for new users
- **`WelcomeToast`** - Welcome message with tour invitation

### Configuration

- **`onboarding-steps.tsx`** - Tour step definitions and content
- **`use-onboarding.ts`** - Custom hook for tour state management
- **`onboarding.css`** - Custom styling for enhanced UX

## Usage

The onboarding system is automatically integrated into the app. No additional setup required.

### For New Users

- Tour starts automatically after 1.5 seconds
- Welcome toast appears with option to start tour
- All interactions are tracked in localStorage

### For Returning Users

- Access tour via help button (❓) in header
- Can reset progress and restart anytime
- Previous completion status is remembered

## Tour Steps

1. **Welcome** - Introduction to Karaoke Milay
2. **Upload Audio** - How to upload audio files
3. **Create Lyrics** - Using the lyric editor
4. **Preview & Sync** - Lyrics preview functionality
5. **Bulk Import** - External lyrics section
6. **Save Projects** - Project management drawer
7. **Completion** - Final congratulations

## Customization

### Adding New Steps

Add new steps to `onboarding-steps.tsx`:

```tsx
{
  target: '[data-onboarding="your-target"]',
  content: (
    <div>
      <h3>Your Step Title</h3>
      <p>Step description...</p>
    </div>
  ),
  placement: 'bottom',
  disableBeacon: true,
}
```

### Styling

Modify `onboarding.css` to customize:

- Tooltip appearance
- Animations and transitions
- Responsive behavior
- Theme-specific styles

### Targeting Elements

Add `data-onboarding="unique-id"` attributes to components you want to highlight in the tour.

## Technical Implementation

- **React Joyride**: Core tour functionality
- **Zustand**: State management integration
- **shadcn/ui**: Consistent component styling
- **Tailwind CSS**: Responsive design
- **localStorage**: Progress persistence

## Accessibility

- Full keyboard navigation support
- Screen reader friendly content
- Proper ARIA labels and roles
- Skip functionality for users who prefer not to tour
- Reduced motion support via CSS

## Performance

- Lazy loading of tour content
- Minimal bundle impact
- Efficient re-renders with memo
- Optional tour activation

---

Built with ❤️ for an amazing karaoke experience!
