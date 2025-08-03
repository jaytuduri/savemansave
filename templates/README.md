# Templates Directory

This directory contains HTML template files that have been extracted from the main `index.html` file to improve code organization and maintainability.

## Template Files

### `header.html`
Contains the application header with title, subtitle, and action buttons, plus the step progress indicator.

### `step1-goal.html`
Contains the financial goal form section including:
- Currency selector
- Goal amount input
- Current savings input
- Timeframe selection with unit toggle
- Investment toggle and ROI input

### `step2-income.html`
Contains the income and expenses form section including:
- Multiple income earners toggle
- Income input fields
- Monthly expenses input

### `step3-results.html`
Contains the results display section including:
- Hero result card
- Detailed results grid with all calculated values

### `chart-section.html`
Contains the chart section with canvas element for displaying the savings growth chart.

### `tips-section.html`
Contains the tips section where personalized advice is displayed.

### `share-modal.html`
Contains the share modal with all sharing options and the success toast notification.

## How It Works

1. Templates are loaded automatically by `js/template-loader.js` when the page loads
2. Each template is fetched via HTTP and injected into its corresponding container div
3. The main `index.html` file now only contains container divs and script references
4. This modular approach makes the code much more maintainable and easier to edit

## Benefits of This Refactoring

- **Separation of Concerns**: Each template handles a specific section
- **Maintainability**: Easier to find and edit specific UI components
- **Reduced File Size**: Main HTML file went from 1000+ lines to ~70 lines
- **Modularity**: Templates can be reused or swapped out easily
- **Better Organization**: Related HTML is grouped together logically

## Fallback

If template loading fails, the application will still work as the JavaScript modules handle all the functionality. The template loader includes error handling to gracefully degrade if needed.