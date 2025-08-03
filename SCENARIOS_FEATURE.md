# What-If Scenarios Feature

This document describes the new **What-If Scenarios** feature that replaces the Tips section in SavePlan Pro.

## Overview

The What-If Scenarios feature provides users with interactive alternatives to help them reach their savings goals faster or with less financial pressure. Instead of generic tips, users now see personalized scenarios based on their specific financial situation.

## Feature Implementation

### Files Changed
- **Added:** `js/scenarios.js` - Core scenarios logic
- **Modified:** `index.html` - Replaced Tips section with Scenarios section
- **Modified:** `css/styles.css` - Updated styling from tips to scenarios
- **Modified:** `js/main.js` - Updated to use scenarios manager instead of tips manager
- **Archived:** `temp-tips-section.html` - Original Tips section HTML for restoration if needed

### JavaScript Architecture

The `ScenariosManager` class handles:
- Scenario generation based on user financial data
- Complex financial calculations for each scenario
- Dynamic HTML generation and animation
- Responsive display management

## Available Scenarios

### 1. The "10% More" Rule (Savings Boost)
- **Purpose:** Shows impact of increasing monthly savings by 10%
- **Calculation:** Compares time to goal with current vs. 10% higher savings
- **Display:** "By increasing your monthly savings by 10% (to €X), you could reach your goal Y months faster"

### 2. The "10% Less" Rule (Expense Reduction)
- **Purpose:** Demonstrates effect of cutting expenses and redirecting to savings
- **Calculation:** Takes 10% of monthly expenses and adds to savings
- **Display:** "By cutting your expenses by 10% (saving an extra €X/month), you could reach your goal Y months faster"

### 3. The "Round Up" Rule (Behavioral)
- **Purpose:** Uses psychology of round numbers to encourage higher savings
- **Logic:** Rounds up to next €25, €50, €100, or €250 based on current amount
- **Display:** "By rounding up your savings to €X/month, you could reach your goal Y months faster"

### 4. The "Cost of Cash" Scenario (Investment)
- **Purpose:** Educates about opportunity cost of not investing
- **Trigger:** Only shows when current ROI < 3%
- **Calculation:** Compares 0% vs 4% annual return scenarios
- **Display:** "By investing your savings at a conservative 4% return, you could reach your goal Y years sooner"

### 5. The "Side Hustle" Scenario (Income Boost)
- **Purpose:** Models impact of additional income streams
- **Assumption:** €250/month extra income
- **Display:** "Earning an extra €250/month from a side project could accelerate your goal by Y years"

### 6. The "One More Year" Scenario (Timeline Extension)
- **Purpose:** Shows how patience reduces monthly financial pressure
- **Calculation:** Extends timeline by 12 months, calculates new required monthly savings
- **Display:** "By extending your timeline by one year, your required monthly savings would drop to just €X"

## User Experience Features

### Visual Design
- **Card-based layout** with color-coded categories
- **Difficulty indicators** (Easy/Medium/Hard)
- **Impact metrics** prominently displayed
- **Category badges** for organization
- **Smooth animations** for engagement

### Responsive Design
- **Grid layout** that adapts to screen size
- **Mobile-optimized** single-column layout on small screens
- **Touch-friendly** interactive elements

### Smart Display Logic
- **Conditional scenarios** - only shows relevant options
- **Priority-based sorting** - most impactful scenarios first
- **Zero-state handling** - shows encouraging message when plan is already optimal

## Technical Implementation

### Key Calculations

```javascript
// Time to goal calculation with compound interest
calculateTimeToGoal(monthlyPayment, currentSavings, goal, annualRate) {
    if (annualRate === 0) {
        return Math.ceil((goal - currentSavings) / monthlyPayment);
    }
    const monthlyRate = annualRate / 100 / 12;
    const months = Math.log(1 + ((goal - currentSavings) * monthlyRate) / monthlyPayment) 
                  / Math.log(1 + monthlyRate);
    return Math.ceil(months);
}
```

### Chart Integration

The scenarios are now visualized on the main savings chart with:
- **Dashed lines** for each scenario projection
- **Color-coded** scenarios for easy identification
- **Interactive toggles** to show/hide main plan and scenarios
- **Real-time updates** when scenarios change

### Scenario Structure
Each scenario includes:
- `id` - Unique identifier
- `type` - Category for styling
- `icon` - SVG icon
- `title` & `subtitle` - Display text
- `description` - Detailed explanation
- `impact` - Time/money saved
- `newValue` - Required action
- `difficulty` - Implementation complexity
- `category` - Grouping label

### CSS Organization
- **Modular styling** with scenario-type specific colors
- **CSS custom properties** for consistent theming
- **Animation classes** for smooth transitions
- **Print styles** for document generation
- **Chart controls** for interactive scenario toggling

## Integration Points

### Data Flow
1. Main calculation engine generates financial data
2. `scenariosManager.generateScenarios(data)` processes scenarios
3. Scenarios displayed in `#scenariosContainer`
4. Chart data generated for each scenario via `generateChartDataForScenarios()`
5. Chart updated with scenario lines via `updateChartWithScenarios()`
6. User interactions trigger animations and chart updates

### Module Integration
- **main.js** calls scenarios manager after calculations
- **chart.js** receives scenario data and renders visualization
- **Chart controls** allow users to toggle scenario visibility
- **Export functionality** includes scenario data
- **Reset functionality** clears scenarios and chart
- **Responsive to** all form input changes

## Benefits Over Previous Tips System

1. **Personalized & Actionable** - Specific to user's situation
2. **Quantified Impact** - Shows exact time/money savings
3. **Visual Integration** - Scenarios shown directly on chart
4. **Interactive Design** - More engaging visual presentation
5. **Behavioral Psychology** - Leverages proven financial principles
6. **Educational Value** - Teaches financial optimization concepts

## Future Enhancement Opportunities

- **Custom scenario builder** for user-defined what-ifs
- **Scenario comparison tool** to evaluate multiple options
- **Individual scenario toggles** for granular chart control
- **Scenario intersection highlighting** showing goal achievement points
- **Historical tracking** of chosen scenarios
- **Social sharing** of scenario results
- **Advanced scenarios** (tax optimization, investment diversification, etc.)
- **Chart annotations** to mark key scenario milestones