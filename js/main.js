/**
 * Main Application Controller for SavePlan Pro
 * Coordinates all modules and handles the core application logic
 */

class SavePlanApp {
  constructor() {
    this.state = {
      goal: 0,
      current: 0,
      months: 0,
      roi: 0,
      expenses: 0,
      isCalculating: false,
    };

    this.modules = {
      income: null,
      chart: null,
      tips: null,
    };

    this.init();
  }

  init() {
    this.initializeModules();
    this.setupEventListeners();
    this.initializeIcons();
    this.setupAnimations();

    // Initial calculation after short delay to ensure all modules are ready
    setTimeout(() => {
      this.calculate();
    }, 100);
  }

  initializeModules() {
    // Modules will be initialized by their own scripts
    // We'll reference them through the global window object
    this.modules.income = window.incomeManager;
    this.modules.chart = window.chartManager;
    this.modules.tips = window.tipsManager;
  }

  setupEventListeners() {
    // Main input fields
    const mainInputs = ["goal", "current", "timeframe", "roi", "expenses"];
    mainInputs.forEach((inputId) => {
      const element = document.getElementById(inputId);
      if (element) {
        addEventListenerSafe(
          element,
          "input",
          debounce(() => {
            this.handleInputChange(inputId, element.value);
          }, 300),
        );

        // Add immediate visual feedback for large inputs
        if (inputId === "goal" || inputId === "current") {
          addEventListenerSafe(element, "input", () => {
            this.updateProgressBar();
          });
        }
      }
    });

    // Window events
    addEventListenerSafe(
      window,
      "resize",
      debounce(() => {
        this.handleResize();
      }, 250),
    );

    // Visibility change (for performance optimization)
    addEventListenerSafe(document, "visibilitychange", () => {
      this.handleVisibilityChange();
    });

    // Tab switching
    this.setupTabSwitching();
  }

  setupTabSwitching() {
    addEventListenerSafe(".tab", "click", (e) => {
      this.switchTab(e.target);
    });
  }

  handleInputChange(inputId, value) {
    const numValue = parseFloat(value) || 0;

    // Validate input
    if (!this.validateInput(inputId, numValue)) {
      return;
    }

    // Update state - convert timeframe to months for internal calculations
    if (inputId === "timeframe") {
      this.state.months = this.getMonthsFromTimeframe(numValue);
    } else {
      this.state[inputId] = numValue;
    }

    // Trigger calculation
    this.calculate();
  }

  validateInput(inputId, value) {
    const validations = {
      goal: (val) => val > 0 && val <= 100000000, // Max 100M EUR
      current: (val) => val >= 0 && val <= (this.state.goal || 100000000),
      timeframe: (val) => val > 0 && val <= 600, // Max 50 years or 600 months
      roi: (val) => val >= -10 && val <= 30, // ROI between -10% and 30%
      expenses: (val) => val >= 0,
    };

    const validation = validations[inputId];
    if (validation && !validation(value)) {
      this.showValidationError(inputId, value);
      return false;
    }

    return true;
  }

  showValidationError(inputId, value) {
    const element = document.getElementById(inputId);
    if (element) {
      element.style.borderColor = "var(--danger)";
      setTimeout(() => {
        element.style.borderColor = "";
      }, 2000);
    }
  }

  calculate() {
    if (this.state.isCalculating) return;

    this.state.isCalculating = true;

    try {
      const calculationData = this.gatherCalculationData();
      const results = this.performCalculations(calculationData);
      this.updateUI(results);
      this.updateModules(results);
    } catch (error) {
      console.error("Calculation error:", error);
      this.handleCalculationError(error);
    } finally {
      this.state.isCalculating = false;
    }
  }

  gatherCalculationData() {
    const totalIncome = this.modules.income
      ? this.modules.income.getTotalIncome()
      : 0; // Fallback

    // Check if investing is enabled
    const investingToggle = document.getElementById("investingToggle");
    const isInvesting = investingToggle ? investingToggle.checked : false;
    const effectiveROI = isInvesting ? this.state.roi : 0;

    return {
      goal: this.state.goal,
      current: this.state.current,
      months: this.state.months,
      roi: effectiveROI,
      expenses: this.state.expenses,
      totalIncome: totalIncome,
      isInvesting: isInvesting,
    };
  }

  getMonthsFromTimeframe(value) {
    // Get months from timeframe input, considering the current unit
    if (typeof getTimeframeInMonths === "function") {
      return getTimeframeInMonths();
    }
    // Fallback - assume months if function not available
    return value || 0;
  }

  getEmptyResults() {
    return {
      goal: 0,
      current: 0,
      months: 0,
      roi: 0,
      totalIncome: 0,
      expenses: 0,
      remaining: 0,
      requiredMonthly: 0,
      availableIncome: 0,
      surplus: 0,
      savingsRate: 0,
      futureValue: 0,
      totalContributions: 0,
      interestEarned: 0,
      actualTimeToGoal: 0,
    };
  }

  performCalculations(data) {
    const { goal, current, months, roi, totalIncome, expenses, isInvesting } =
      data;

    // Skip calculations if essential values are missing
    if (!goal || !months || !totalIncome) {
      return this.getEmptyResults();
    }

    // Basic calculations
    const remaining = Math.max(0, goal - current);

    // Calculate required monthly payment based on investing status
    let requiredMonthly = 0;
    if (months > 0) {
      if (isInvesting && roi > 0) {
        // Use compound interest calculation for investing
        requiredMonthly = calculateRequiredMonthlyPayment(
          current,
          goal,
          months,
          roi / 100,
        );
      } else {
        // Use simple division for non-investing
        requiredMonthly = remaining / months;
      }
    }
    const availableIncome = totalIncome - expenses;
    const surplus = availableIncome - requiredMonthly;
    const savingsRate =
      totalIncome > 0 ? (requiredMonthly / totalIncome) * 100 : 0;

    // Compound interest calculations
    const monthlyRate = roi / 100 / 12;
    const futureValue = calculateCompoundInterest(
      current,
      requiredMonthly,
      roi / 100,
      months,
    );

    const totalContributions = requiredMonthly * months;
    const interestEarned = Math.max(
      0,
      futureValue - current - totalContributions,
    );

    // Time to goal calculation
    const actualTimeToGoal = calculateTimeToGoal(
      current,
      goal,
      requiredMonthly,
      roi / 100,
    );

    return {
      ...data,
      remaining,
      requiredMonthly,
      availableIncome,
      surplus,
      savingsRate,
      futureValue,
      totalContributions,
      interestEarned,
      actualTimeToGoal,
    };
  }

  updateUI(results) {
    const {
      requiredMonthly,
      totalIncome,
      expenses,
      availableIncome,
      savingsRate,
      futureValue,
      totalContributions,
      interestEarned,
      actualTimeToGoal,
      surplus,
    } = results;

    // Update result displays
    setElementText("heroAmount", formatCurrency(requiredMonthly));
    setElementText("householdIncome", formatCurrency(totalIncome));
    setElementText(
      "availableIncome",
      formatCurrency(totalIncome - expenses - requiredMonthly),
    );
    setElementText("savingsRate", formatPercent(savingsRate));
    setElementText("futureValue", formatCurrency(futureValue));
    setElementText("totalContributions", formatCurrency(totalContributions));
    setElementText("interestEarned", formatCurrency(interestEarned));

    // Update hero status
    this.updateHeroStatus(surplus, totalIncome);

    // Update progress bar and text
    this.updateProgressBar();
  }

  updateHeroStatus(surplus, totalIncome) {
    const heroStatus = document.getElementById("heroStatus");
    if (!heroStatus) return;

    let statusText, iconSvg, statusClass;

    if (surplus < 0) {
      statusText =
        "This plan needs adjustment - you may need more time or a smaller goal";
      statusClass = "status-danger";
      iconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" x2="9" y1="9" y2="15"/>
                    <line x1="9" x2="15" y1="9" y2="15"/>
                </svg>
            `;
    } else if (surplus < totalIncome * 0.1) {
      statusText =
        "This plan is tight but doable - watch your budget carefully";
      statusClass = "status-warning";
      iconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/>
                    <path d="m12 17 .01 0"/>
                </svg>
            `;
    } else {
      statusText =
        "This looks achievable! You'll have a good financial cushion";
      statusClass = "status-good";
      iconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
            `;
    }

    heroStatus.className = `hero-status ${statusClass}`;
    heroStatus.innerHTML = `${iconSvg}${statusText}`;
  }

  updateProgressBar() {
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");

    if (!progressFill) return;

    if (this.state.goal === 0) {
      progressFill.style.width = "0%";
      if (progressText) {
        progressText.textContent = "Enter your goal and current savings";
      }
      return;
    }

    const progress = Math.min(
      (this.state.current / this.state.goal) * 100,
      100,
    );
    progressFill.style.width = `${progress}%`;

    if (progressText) {
      progressText.textContent = `${Math.round(progress)}% of your goal`;
    }
  }

  updateModules(results) {
    // Update chart
    if (this.modules.chart && this.modules.chart.updateChart) {
      this.modules.chart.updateChart(results);
    }

    // Update tips
    if (this.modules.tips && this.modules.tips.generateTips) {
      this.modules.tips.generateTips(results);
    }
  }

  handleCalculationError(error) {
    console.error("Calculation failed:", error);

    // Show user-friendly error message
    const errorContainer = this.createErrorMessage(
      "Calculation Error",
      "Unable to calculate results. Please check your inputs and try again.",
    );

    this.showTemporaryMessage(errorContainer);
  }

  createErrorMessage(title, message) {
    return `
            <div class="error-message">
                <strong>${title}:</strong> ${message}
            </div>
        `;
  }

  showTemporaryMessage(html, duration = 5000) {
    const messageEl = document.createElement("div");
    messageEl.innerHTML = html;
    messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, duration);
  }

  switchTab(tabElement) {
    if (!tabElement) return;

    // Update tab buttons
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    tabElement.classList.add("active");

    // Tab content switching would go here
    // Currently just visual feedback
    console.log("Switched to tab:", tabElement.textContent);
  }

  handleResize() {
    if (this.modules.chart && this.modules.chart.resize) {
      this.modules.chart.resize();
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause expensive operations
      this.pauseAnimations();
    } else {
      // Page is visible, resume operations
      this.resumeAnimations();
    }
  }

  pauseAnimations() {
    document.querySelectorAll(".animate-in").forEach((el) => {
      el.style.animationPlayState = "paused";
    });
  }

  resumeAnimations() {
    document.querySelectorAll(".animate-in").forEach((el) => {
      el.style.animationPlayState = "running";
    });
  }

  initializeIcons() {
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  setupAnimations() {
    // Stagger entrance animations
    const animatedElements = document.querySelectorAll(".animate-in");
    animatedElements.forEach((element, index) => {
      element.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover animations to result items
    addEventListenerSafe(".result-item", "mouseenter", (e) => {
      e.target.style.transform = "scale(1.02)";
    });

    addEventListenerSafe(".result-item", "mouseleave", (e) => {
      e.target.style.transform = "scale(1)";
    });
  }

  exportData() {
    return {
      state: this.state,
      timestamp: new Date().toISOString(),
      income: this.modules.income ? this.modules.income.exportData() : null,
      tips: this.modules.tips ? this.modules.tips.exportTips() : null,
    };
  }

  importData(data) {
    if (!data || !data.state) return;

    // Update state
    Object.assign(this.state, data.state);

    // Update UI inputs
    Object.keys(this.state).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        element.value = this.state[key];
      }
    });

    // Import module data
    if (data.income && this.modules.income) {
      this.modules.income.importData(data.income);
    }

    // Recalculate
    this.calculate();
  }

  reset() {
    // Reset state to defaults
    this.state = {
      goal: 1000000,
      current: 0,
      months: 360,
      roi: 5,
      expenses: 2000,
      isCalculating: false,
    };

    // Reset modules
    if (this.modules.income && this.modules.income.reset) {
      this.modules.income.reset();
    }

    if (this.modules.tips && this.modules.tips.clearTips) {
      this.modules.tips.clearTips();
    }

    // Update UI
    Object.keys(this.state).forEach((key) => {
      if (key === "months") {
        // Handle timeframe input specially
        const timeframeElement = document.getElementById("timeframe");
        if (timeframeElement) {
          timeframeElement.value = 30; // Reset to 30 years
          if (typeof switchTimeframeUnit === "function") {
            switchTimeframeUnit("years"); // Reset to years unit
          }
        }
      } else {
        const element = document.getElementById(key);
        if (element) {
          element.value = this.state[key];
        }
      }
    });

    // Reset investing toggle
    const investingToggle = document.getElementById("investingToggle");
    if (investingToggle) {
      investingToggle.checked = true;
      handleInvestingToggle(true);
    }

    // Recalculate
    this.calculate();
  }

  getCalculationSummary() {
    const data = this.gatherCalculationData();
    const results = this.performCalculations(data);

    return {
      goal: formatCurrency(results.goal),
      currentSavings: formatCurrency(results.current),
      timeframe: `${results.months} months`,
      requiredMonthlySaving: formatCurrency(results.requiredMonthly),
      expectedROI: `${results.roi}%`,
      projectedFinalValue: formatCurrency(results.futureValue),
      totalInterestEarned: formatCurrency(results.interestEarned),
      savingsRate: formatPercent(results.savingsRate),
      feasibility: results.surplus >= 0 ? "Achievable" : "Needs Adjustment",
    };
  }
}

// Global functions for HTML onclick handlers (backward compatibility)
function switchTab(tab) {
  if (window.calculator && window.calculator.switchTab) {
    window.calculator.switchTab(tab);
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for all modules to initialize
  setTimeout(() => {
    window.calculator = new SavePlanApp();

    // Make it globally accessible for debugging
    if (typeof window !== "undefined") {
      window.SavePlan = {
        app: window.calculator,
        utils: {
          formatCurrency,
          formatPercent,
          calculateCompoundInterest,
          calculateTimeToGoal,
        },
      };
    }
  }, 200);
});

// Global currency change handler
function handleCurrencyChange(newCurrency) {
  setCurrency(newCurrency);
}

// Global investing toggle handler
function handleInvestingToggle(isInvesting) {
  const roiSection = document.getElementById("roiSection");
  const investingText = document.getElementById("investingText");

  if (roiSection) {
    if (isInvesting) {
      roiSection.style.display = "block";
      roiSection.style.opacity = "0";
      roiSection.style.transform = "translateY(-10px)";
      setTimeout(() => {
        roiSection.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        roiSection.style.opacity = "1";
        roiSection.style.transform = "translateY(0)";
      }, 10);
    } else {
      roiSection.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      roiSection.style.opacity = "0";
      roiSection.style.transform = "translateY(-10px)";
      setTimeout(() => {
        roiSection.style.display = "none";
      }, 300);
    }
  }

  if (investingText) {
    investingText.textContent = isInvesting ? "Yes" : "No";
  }

  // Trigger recalculation when investing status changes
  if (window.app && typeof window.app.calculate === "function") {
    window.app.calculate();
  }

  // Trigger recalculation
  if (window.calculator && typeof window.calculator.calculate === "function") {
    window.calculator.calculate();
  }
}

// Initialize currency system
document.addEventListener("DOMContentLoaded", () => {
  // Set EUR as default currency
  setCurrency("EUR");

  // Initialize investing toggle state
  const investingToggle = document.getElementById("investingToggle");
  if (investingToggle) {
    handleInvestingToggle(investingToggle.checked);
  }
});

// Handle potential loading issues
window.addEventListener("load", () => {
  if (!window.calculator) {
    console.warn("SavePlan calculator not initialized, retrying...");
    setTimeout(() => {
      if (!window.calculator) {
        window.calculator = new SavePlanApp();
      }
    }, 500);
  }
});
