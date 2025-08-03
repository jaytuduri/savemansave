/**
 * Timeframe Module for SavePlan Pro
 * Handles timeframe unit switching and display formatting
 */

class TimeframeManager {
  constructor() {
    this.currentUnit = "years";
    this.init();
  }

  init() {
    // Initialize event listeners when DOM is loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupEventListeners(),
      );
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    const timeframeInput = document.getElementById("timeframe");
    if (timeframeInput) {
      timeframeInput.addEventListener("input", () => this.updateDisplay());
      this.updateDisplay(); // Initial call
    }
  }

  updateDisplay() {
    const timeframeValue =
      parseFloat(document.getElementById("timeframe").value) || 0;
    let displayText = "";

    if (this.currentUnit === "months") {
      const years = Math.round((timeframeValue / 12) * 10) / 10;
      if (timeframeValue === 1) {
        displayText = "That's 1 month";
      } else if (years === 1) {
        displayText = "That's 1 year";
      } else if (years < 1) {
        displayText = `That's ${timeframeValue} months`;
      } else {
        displayText =
          years % 1 === 0
            ? `That's ${Math.round(years)} years`
            : `That's ${years} years`;
      }
    } else {
      const months = Math.round(timeframeValue * 12);
      if (timeframeValue === 1) {
        displayText = "That's 12 months";
      } else if (timeframeValue === 0.5) {
        displayText = "That's 6 months";
      } else {
        displayText = `That's ${months} months`;
      }
    }

    const displayElement = document.getElementById("timeframeDisplay");
    if (displayElement) {
      displayElement.textContent = displayText;
    }
  }

  switchUnit(unit) {
    const timeframeInput = document.getElementById("timeframe");
    const timeframeSuffix = document.getElementById("timeframeSuffix");
    const currentValue = parseFloat(timeframeInput.value) || 0;

    // Remove active class from all buttons
    document.querySelectorAll(".timeframe-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    const targetButton = document.querySelector(`[data-unit="${unit}"]`);
    if (targetButton) {
      targetButton.classList.add("active");
    }

    // Convert value if switching units
    if (this.currentUnit !== unit) {
      let newValue;
      if (unit === "years" && this.currentUnit === "months") {
        // Converting months to years
        newValue = Math.round((currentValue / 12) * 10) / 10;
        if (newValue < 0.5) newValue = 0.5; // Minimum 6 months
      } else if (unit === "months" && this.currentUnit === "years") {
        // Converting years to months
        newValue = Math.round(currentValue * 12);
        if (newValue < 1) newValue = 1; // Minimum 1 month
      } else {
        newValue = currentValue;
      }

      timeframeInput.value = newValue;
      timeframeInput.step = unit === "years" ? "0.5" : "1";
      timeframeInput.min = unit === "years" ? "0.5" : "1";
    }

    this.currentUnit = unit;
    if (timeframeSuffix) {
      timeframeSuffix.textContent = unit;
    }
    this.updateDisplay();

    // Trigger recalculation
    this.triggerRecalculation();
  }

  handleChange() {
    this.updateDisplay();
    this.triggerRecalculation();
  }

  getTimeframeInMonths() {
    const value = parseFloat(document.getElementById("timeframe").value) || 0;
    return this.currentUnit === "years" ? Math.round(value * 12) : value;
  }

  triggerRecalculation() {
    if (
      window.calculator &&
      typeof window.calculator.calculate === "function"
    ) {
      window.calculator.calculate();
    }
  }
}

// Create global instance and expose functions for backward compatibility
window.timeframeManager = new TimeframeManager();

// Global functions for onclick handlers (backward compatibility)
window.updateTimeframeDisplay = () => window.timeframeManager.updateDisplay();
window.switchTimeframeUnit = (unit) => window.timeframeManager.switchUnit(unit);
window.handleTimeframeChange = () => window.timeframeManager.handleChange();
window.getTimeframeInMonths = () =>
  window.timeframeManager.getTimeframeInMonths();
