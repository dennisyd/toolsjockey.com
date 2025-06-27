# Ad Placeholders in ToolsJockey

## Overview

Instead of displaying traditional ads, ToolsJockey now uses custom content blocks in ad placeholder spaces to:
1. Highlight the platform's privacy features
2. Promote upcoming tools and features

## Implementation

The implementation is centralized in the `AdSlot` component (`src/components/ads/AdSlot.tsx`), which displays different content based on the slot size:

### 300x250 Placeholders (Sidebar)

These show a "Privacy Guaranteed" message:

```jsx
<div className="feature-highlight bg-blue-50 border border-blue-200 dark:bg-primary-light dark:border-primary-dark rounded-lg p-4 text-center shadow-sm">
  <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">🔒 Your Privacy Guaranteed</h3>
  <p className="my-2 text-gray-700 dark:text-gray-300">All processing happens in your browser. Your files never leave your computer.</p>
  <small className="text-gray-500 dark:text-gray-400">Built by MIT-trained engineer</small>
</div>
```

### 728x90 Placeholders (Header/Footer)

These show upcoming tools:

```jsx
<div className="tools-preview bg-gradient-to-r from-purple-50 to-blue-50 dark:from-primary dark:to-primary-dark border border-blue-100 dark:border-primary-darker rounded-lg p-3 text-center">
  <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-1">More Tools Coming Soon:</h4>
  <div className="flex flex-wrap justify-center gap-2">
    <span className="tool-badge bg-white dark:bg-primary-light px-3 py-1 rounded-full text-sm shadow-sm">📚 PublishJockey</span>
    <span className="tool-badge bg-white dark:bg-primary-light px-3 py-1 rounded-full text-sm shadow-sm">✍️ WriteJockey</span>
    <span className="tool-badge bg-white dark:bg-primary-light px-3 py-1 rounded-full text-sm shadow-sm">🎯 Business Suite</span>
  </div>
</div>
```

## Usage

All ad placeholders are implemented using the `AdSlot` component:

```jsx
// For sidebar ads (300x250):
<AdSlot slot="sidebar" className="optional-classes" />

// For header/footer ads (728x90):
<AdSlot slot="header" className="optional-classes" />
<AdSlot slot="footer" className="optional-classes" />
```

## Ad Blocker Handling

The component still includes ad blocker detection which shows a friendly message asking users to whitelist the site when an ad blocker is detected.

## Future Considerations

To implement real ads in the future:
1. Update the `AdSlot` component to include actual ad code
2. Keep the same component API to minimize changes throughout the codebase 