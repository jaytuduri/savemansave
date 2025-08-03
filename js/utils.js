/**
 * Utility functions for SavePlan Pro
 * Handles formatting, validation, and common helpers
 */

// Current currency state
let currentCurrency = "EUR";
let currentLocale = "en-EU";

// Currency configurations
const currencyConfigs = {
  EUR: { locale: "en-EU", symbol: "€" },
  SEK: { locale: "sv-SE", symbol: "kr" },
  USD: { locale: "en-US", symbol: "$" },
  GBP: { locale: "en-GB", symbol: "£" },
  NOK: { locale: "nb-NO", symbol: "kr" },
  DKK: { locale: "da-DK", symbol: "kr" },
};

// Dynamic formatters
function getFormatters() {
  const config = currencyConfigs[currentCurrency];
  return {
    currency: new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currentCurrency,
      maximumFractionDigits: 0,
    }),
    percent: new Intl.NumberFormat(config.locale, {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    number: new Intl.NumberFormat(config.locale, {
      maximumFractionDigits: 0,
    }),
  };
}

/**
 * Set the current currency
 * @param {string} currency - The currency code (EUR, SEK, USD, etc.)
 */
function setCurrency(currency) {
  if (currencyConfigs[currency]) {
    currentCurrency = currency;
    currentLocale = currencyConfigs[currency].locale;

    // Update all currency displays
    updateAllCurrencyDisplays();
  }
}

/**
 * Update all currency suffixes in the DOM
 */
function updateAllCurrencyDisplays() {
  // Update input suffixes, but skip percentage suffixes
  const suffixes = document.querySelectorAll(".input-suffix");
  suffixes.forEach((suffix) => {
    // Only update if it's not a percentage suffix
    if (suffix.textContent !== "%") {
      suffix.textContent = currentCurrency;
    }
  });

  // Trigger recalculation to update all displayed values
  if (typeof window.app !== "undefined" && window.app.calculate) {
    window.app.calculate();
  }
}

/**
 * Get the current currency
 * @returns {string} Current currency code
 */
function getCurrentCurrency() {
  return currentCurrency;
}

/**
 * Get investing status
 * @returns {boolean} Whether investing is enabled
 */
function getInvestingStatus() {
  const investingToggle = document.getElementById("investingToggle");
  return investingToggle ? investingToggle.checked : true;
}

/**
 * Format a number as currency
 * @param {number} num - The number to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(num) {
  if (isNaN(num) || num === null || num === undefined)
    return `0 ${currentCurrency}`;
  return getFormatters().currency.format(num);
}

/**
 * Format a number as percentage
 * @param {number} num - The number to format (as decimal, e.g., 0.05 for 5%)
 * @returns {string} Formatted percentage string
 */
function formatPercent(num) {
  if (isNaN(num) || num === null || num === undefined) return "0%";
  return getFormatters().percent.format(num / 100);
}

/**
 * Format a large number with thousand separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  if (isNaN(num) || num === null || num === undefined) return "0";
  return getFormatters().number.format(num);
}

/**
 * Get the value of an input element by ID
 * @param {string} id - The element ID
 * @returns {number} The parsed float value or 0
 */
function getInputValue(id) {
  const element = document.getElementById(id);
  if (!element) return 0;
  return parseFloat(element.value) || 0;
}

/**
 * Set the text content of an element by ID
 * @param {string} id - The element ID
 * @param {string} text - The text to set
 */
function setElementText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

/**
 * Add event listener to elements safely
 * @param {string|Element} selector - CSS selector or DOM element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 */
function addEventListenerSafe(selector, event, handler) {
  const elements =
    typeof selector === "string"
      ? document.querySelectorAll(selector)
      : [selector];

  elements.forEach((element) => {
    if (element && typeof element.addEventListener === "function") {
      element.addEventListener(event, handler);
    }
  });
}

/**
 * Validate if a number is positive
 * @param {number} num - Number to validate
 * @returns {boolean} True if positive
 */
function isPositiveNumber(num) {
  return !isNaN(num) && num > 0;
}

/**
 * Clamp a number between min and max values
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Calculate compound interest
 * @param {number} principal - Initial amount
 * @param {number} monthlyContribution - Monthly contribution
 * @param {number} annualRate - Annual interest rate (as decimal)
 * @param {number} months - Number of months
 * @returns {number} Future value
 */
function calculateCompoundInterest(
  principal,
  monthlyContribution,
  annualRate,
  months,
) {
  if (annualRate === 0) {
    return principal + monthlyContribution * months;
  }

  const monthlyRate = annualRate / 12;
  const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, months);
  const futureValueContributions =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return futureValuePrincipal + futureValueContributions;
}

/**
 * Calculate how long it will take to reach a goal
 * @param {number} current - Current savings
 * @param {number} goal - Target goal
 * @param {number} monthlyContribution - Monthly contribution
 * @param {number} annualRate - Annual interest rate (as decimal)
 * @returns {number} Months to reach goal
 */
function calculateTimeToGoal(
  current,
  goal,
  monthlyContribution,
  annualRate = 0,
) {
  if (monthlyContribution <= 0) return Infinity;

  const remaining = goal - current;
  if (remaining <= 0) return 0;

  if (annualRate === 0) {
    return Math.ceil(remaining / monthlyContribution);
  }

  const monthlyRate = annualRate / 12;
  // Using logarithmic formula for compound interest
  const months =
    Math.log(1 + (remaining * monthlyRate) / monthlyContribution) /
    Math.log(1 + monthlyRate);

  return Math.ceil(months);
}

/**
 * Calculate required monthly payment to reach a goal with compound interest
 * @param {number} current - Current savings amount
 * @param {number} goal - Target goal amount
 * @param {number} months - Number of months to save
 * @param {number} annualRate - Annual interest rate (as decimal)
 * @returns {number} Required monthly payment
 */
function calculateRequiredMonthlyPayment(
  current,
  goal,
  months,
  annualRate = 0,
) {
  const remaining = Math.max(0, goal - current);

  if (months <= 0 || remaining <= 0) return 0;

  if (annualRate === 0) {
    return remaining / months;
  }

  const monthlyRate = annualRate / 12;

  if (current === 0) {
    return goal / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  const futureValueOfCurrent = current * Math.pow(1 + monthlyRate, months);
  const compoundFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;

  return Math.max(0, (goal - futureValueOfCurrent) / compoundFactor);
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Show/hide elements with smooth transitions
 * @param {string|Element} selector - Element selector or element
 * @param {boolean} show - Whether to show or hide
 */
function toggleElement(selector, show) {
  const element =
    typeof selector === "string" ? document.querySelector(selector) : selector;

  if (!element) return;

  if (show) {
    element.style.display = "flex";
    element.style.opacity = "0";
    setTimeout(() => {
      element.style.transition = "opacity 0.3s ease";
      element.style.opacity = "1";
    }, 10);
  } else {
    element.style.transition = "opacity 0.3s ease";
    element.style.opacity = "0";
    setTimeout(() => {
      element.style.display = "none";
    }, 300);
  }
}

/**
 * Animate a number change
 * @param {Element} element - Target element
 * @param {number} start - Starting number
 * @param {number} end - Ending number
 * @param {number} duration - Animation duration in ms
 * @param {Function} formatter - Number formatting function
 */
function animateNumber(
  element,
  start,
  end,
  duration = 1000,
  formatter = formatNumber,
) {
  const startTime = Date.now();
  const difference = end - start;

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = start + difference * easeOutCubic;

    element.textContent = formatter(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Export for use in other modules (if using ES6 modules)
// export {
//     formatCurrency,
//     formatPercent,
//     formatNumber,
//     getInputValue,
//     setElementText,
//     addEventListenerSafe,
//     isPositiveNumber,
//     clamp,
//     calculateCompoundInterest,
//     calculateTimeToGoal,
//     debounce,
//     generateId,
//     deepClone,
//     toggleElement,
//     animateNumber
// };
