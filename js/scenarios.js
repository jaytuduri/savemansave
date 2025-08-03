/**
 * What-If Scenarios Module for SavePlan Pro
 * Generates alternative savings scenarios to help users explore different paths
 */

class ScenariosManager {
  constructor() {
    this.scenariosContainer = null;
    this.currentData = null;
    this.scenarios = [];
    this.init();
  }

  init() {
    this.scenariosContainer = document.getElementById("scenariosContainer");
    if (!this.scenariosContainer) {
      console.warn("Scenarios container not found");
    }
  }

  generateScenarios(data) {
    this.currentData = data;
    this.scenarios = [];

    const {
      requiredMonthly,
      months,
      roi,
      goal,
      current,
      totalIncome,
      availableIncome,
    } = data;
    const monthlyExpenses = totalIncome - availableIncome;

    // 1. The "10% More" Rule
    const tenPercentMore = this.calculateTenPercentMore(
      requiredMonthly,
      current,
      goal,
      roi,
    );
    if (tenPercentMore.timeSaved > 0) {
      this.scenarios.push({
        id: "10-percent-more",
        type: "savings-boost",
        icon: this.getIcon("trending-up"),
        title: "Save 10% More",
        subtitle: "Small increase, big impact",
        description: `By increasing your monthly savings by 10% (to €${this.formatNumber(tenPercentMore.newMonthly)}), you could reach your goal ${tenPercentMore.timeSaved} months faster.`,
        impact: `${tenPercentMore.timeSaved} months faster`,
        newValue: `€${this.formatNumber(tenPercentMore.newMonthly)}/month`,
        difficulty: "Easy",
        category: "Savings Optimization",
      });
    }

    // 2. The "10% Less" Rule (Expense Reduction)
    const tenPercentLessExpenses = this.calculateExpenseReduction(
      monthlyExpenses,
      requiredMonthly,
      current,
      goal,
      roi,
    );
    if (tenPercentLessExpenses.timeSaved > 0) {
      this.scenarios.push({
        id: "expense-reduction",
        type: "expense-cut",
        icon: this.getIcon("scissors"),
        title: "Cut Expenses by 10%",
        subtitle: "Redirect spending to savings",
        description: `By cutting your expenses by 10% (saving an extra €${this.formatNumber(tenPercentLessExpenses.extraSavings)}/month), you could reach your goal ${tenPercentLessExpenses.timeSaved} months faster.`,
        impact: `${tenPercentLessExpenses.timeSaved} months faster`,
        newValue: `+€${this.formatNumber(tenPercentLessExpenses.extraSavings)}/month`,
        difficulty: "Medium",
        category: "Expense Management",
      });
    }

    // 3. The "Round Up" Rule
    const roundUp = this.calculateRoundUp(requiredMonthly, current, goal, roi);
    if (roundUp.timeSaved > 0) {
      this.scenarios.push({
        id: "round-up",
        type: "behavioral",
        icon: this.getIcon("target"),
        title: "Round Up Savings",
        subtitle: "Psychology of round numbers",
        description: `By rounding up your savings to €${this.formatNumber(roundUp.roundedAmount)}/month, you could reach your goal ${roundUp.timeSaved} months faster.`,
        impact: `${roundUp.timeSaved} months faster`,
        newValue: `€${this.formatNumber(roundUp.roundedAmount)}/month`,
        difficulty: "Easy",
        category: "Behavioral Finance",
      });
    }

    // 4. The "Cost of Cash" Scenario
    if (roi < 3) {
      const investmentScenario = this.calculateInvestmentScenario(
        requiredMonthly,
        current,
        goal,
        4.0,
      );
      if (investmentScenario.timeSaved > 0) {
        this.scenarios.push({
          id: "investment-boost",
          type: "investment",
          icon: this.getIcon("trending-up-2"),
          title: "Invest for Growth",
          subtitle: "Beat inflation with smart investing",
          description: `By investing your savings at a conservative 4% return instead of ${roi}%, you could reach your goal ${investmentScenario.yearsSaved} years sooner.`,
          impact: `${investmentScenario.yearsSaved} years sooner`,
          newValue: "4% annual return",
          difficulty: "Medium",
          category: "Investment Strategy",
        });
      }
    }

    // 5. The "Side Hustle" Scenario
    const sideHustle = this.calculateSideHustle(
      requiredMonthly,
      current,
      goal,
      roi,
      250,
    );
    if (sideHustle.timeSaved > 0) {
      this.scenarios.push({
        id: "side-hustle",
        type: "income-boost",
        icon: this.getIcon("plus-circle"),
        title: "Side Hustle Boost",
        subtitle: "Extra income, faster results",
        description: `Earning an extra €250/month from a side project could accelerate your goal by ${sideHustle.yearsSaved} years.`,
        impact: `${sideHustle.yearsSaved} years faster`,
        newValue: "+€250/month income",
        difficulty: "Hard",
        category: "Income Generation",
      });
    }

    // 6. The "One More Year" Scenario
    const oneMoreYear = this.calculateOneMoreYear(
      requiredMonthly,
      current,
      goal,
      roi,
      months,
    );
    if (oneMoreYear.savings > 0) {
      this.scenarios.push({
        id: "extend-timeline",
        type: "timeline-extension",
        icon: this.getIcon("clock"),
        title: "Extend by One Year",
        subtitle: "Reduce monthly pressure",
        description: `Feeling the pressure? By extending your timeline by one year, your required monthly savings would drop to just €${this.formatNumber(oneMoreYear.newMonthly)}.`,
        impact: `€${this.formatNumber(oneMoreYear.savings)} less per month`,
        newValue: `€${this.formatNumber(oneMoreYear.newMonthly)}/month`,
        difficulty: "Easy",
        category: "Timeline Optimization",
      });
    }

    this.displayScenarios();
    return this.scenarios;
  }

  calculateTenPercentMore(currentMonthly, currentSavings, goal, roi) {
    const newMonthly = currentMonthly * 1.1;
    const currentTime = this.calculateTimeToGoal(
      currentMonthly,
      currentSavings,
      goal,
      roi,
    );
    const newTime = this.calculateTimeToGoal(
      newMonthly,
      currentSavings,
      goal,
      roi,
    );

    return {
      newMonthly,
      timeSaved: Math.max(0, Math.round(currentTime - newTime)),
      originalTime: currentTime,
      newTime,
    };
  }

  calculateExpenseReduction(
    monthlyExpenses,
    currentMonthly,
    currentSavings,
    goal,
    roi,
  ) {
    const extraSavings = monthlyExpenses * 0.1;
    const newMonthly = currentMonthly + extraSavings;
    const currentTime = this.calculateTimeToGoal(
      currentMonthly,
      currentSavings,
      goal,
      roi,
    );
    const newTime = this.calculateTimeToGoal(
      newMonthly,
      currentSavings,
      goal,
      roi,
    );

    return {
      extraSavings,
      newMonthly,
      timeSaved: Math.max(0, Math.round(currentTime - newTime)),
      originalTime: currentTime,
      newTime,
    };
  }

  calculateRoundUp(currentMonthly, currentSavings, goal, roi) {
    let roundedAmount;

    if (currentMonthly < 100) {
      roundedAmount = Math.ceil(currentMonthly / 25) * 25;
    } else if (currentMonthly < 500) {
      roundedAmount = Math.ceil(currentMonthly / 50) * 50;
    } else if (currentMonthly < 1000) {
      roundedAmount = Math.ceil(currentMonthly / 100) * 100;
    } else {
      roundedAmount = Math.ceil(currentMonthly / 250) * 250;
    }

    if (roundedAmount <= currentMonthly) {
      return { timeSaved: 0, roundedAmount: currentMonthly };
    }

    const currentTime = this.calculateTimeToGoal(
      currentMonthly,
      currentSavings,
      goal,
      roi,
    );
    const newTime = this.calculateTimeToGoal(
      roundedAmount,
      currentSavings,
      goal,
      roi,
    );

    return {
      roundedAmount,
      timeSaved: Math.max(0, Math.round(currentTime - newTime)),
      originalTime: currentTime,
      newTime,
    };
  }

  calculateInvestmentScenario(currentMonthly, currentSavings, goal, newRoi) {
    const currentTime = this.calculateTimeToGoal(
      currentMonthly,
      currentSavings,
      goal,
      0,
    );
    const newTime = this.calculateTimeToGoal(
      currentMonthly,
      currentSavings,
      goal,
      newRoi,
    );
    const timeSavedMonths = Math.max(0, currentTime - newTime);

    return {
      timeSaved: timeSavedMonths,
      yearsSaved: Math.round((timeSavedMonths / 12) * 10) / 10,
      newRoi,
      originalTime: currentTime,
      newTime,
    };
  }

  calculateSideHustle(currentMonthly, currentSavings, goal, roi, extraIncome) {
    const newMonthly = currentMonthly + extraIncome;
    const currentTime = this.calculateTimeToGoal(
      currentMonthly,
      currentSavings,
      goal,
      roi,
    );
    const newTime = this.calculateTimeToGoal(
      newMonthly,
      currentSavings,
      goal,
      roi,
    );
    const timeSavedMonths = Math.max(0, currentTime - newTime);

    return {
      extraIncome,
      newMonthly,
      timeSaved: timeSavedMonths,
      yearsSaved: Math.round((timeSavedMonths / 12) * 10) / 10,
      originalTime: currentTime,
      newTime,
    };
  }

  calculateOneMoreYear(
    currentMonthly,
    currentSavings,
    goal,
    roi,
    currentMonths,
  ) {
    const newMonths = currentMonths + 12;
    const newMonthly = this.calculateRequiredMonthly(
      currentSavings,
      goal,
      newMonths,
      roi,
    );
    const savings = currentMonthly - newMonthly;

    return {
      newMonthly,
      savings,
      newTimeframe: newMonths,
      originalTimeframe: currentMonths,
    };
  }

  calculateTimeToGoal(monthlyPayment, currentSavings, goal, annualRate) {
    const remaining = goal - currentSavings;
    if (remaining <= 0) return 0;

    if (annualRate === 0) {
      return Math.ceil(remaining / monthlyPayment);
    }

    const monthlyRate = annualRate / 100 / 12;
    const months =
      Math.log(1 + (remaining * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate);
    return Math.ceil(months);
  }

  calculateRequiredMonthly(currentSavings, goal, months, annualRate) {
    const remaining = goal - currentSavings;
    if (remaining <= 0) return 0;

    if (annualRate === 0) {
      return remaining / months;
    }

    const monthlyRate = annualRate / 100 / 12;
    return (remaining * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  displayScenarios() {
    if (!this.scenariosContainer) return;

    if (this.scenarios.length === 0) {
      this.scenariosContainer.innerHTML = `
                <div class="no-scenarios">
                    <div class="no-scenarios-icon">${this.getIcon("check-circle")}</div>
                    <h4>Your Plan Looks Great!</h4>
                    <p>Your current savings plan is already well-optimized. Keep up the excellent work!</p>
                </div>
            `;
      return;
    }

    const scenariosHTML = this.scenarios
      .map((scenario) => this.createScenarioHTML(scenario))
      .join("");
    this.scenariosContainer.innerHTML = scenariosHTML;

    // Add animation
    this.animateScenarios();

    // Update chart with scenarios
    this.updateChartWithScenarios();
  }

  createScenarioHTML(scenario) {
    const typeClasses = {
      "savings-boost": "scenario-boost",
      "expense-cut": "scenario-cut",
      behavioral: "scenario-behavioral",
      investment: "scenario-investment",
      "income-boost": "scenario-income",
      "timeline-extension": "scenario-timeline",
    };

    const difficultyColors = {
      Easy: "difficulty-easy",
      Medium: "difficulty-medium",
      Hard: "difficulty-hard",
    };

    return `
            <div class="scenario-card ${typeClasses[scenario.type] || "scenario-default"}" data-scenario-id="${scenario.id}">
                <div class="scenario-header">
                    <div class="scenario-icon">
                        ${scenario.icon}
                    </div>
                    <div class="scenario-title-section">
                        <h4 class="scenario-title">${scenario.title}</h4>
                        <p class="scenario-subtitle">${scenario.subtitle}</p>
                    </div>
                    <div class="scenario-difficulty ${difficultyColors[scenario.difficulty] || "difficulty-medium"}">
                        ${scenario.difficulty}
                    </div>
                </div>
                <div class="scenario-content">
                    <p class="scenario-description">${scenario.description}</p>
                    <div class="scenario-metrics">
                        <div class="scenario-metric">
                            <span class="metric-label">Impact</span>
                            <span class="metric-value impact-value">${scenario.impact}</span>
                        </div>
                        <div class="scenario-metric">
                            <span class="metric-label">Required</span>
                            <span class="metric-value">${scenario.newValue}</span>
                        </div>
                    </div>
                    <div class="scenario-category">
                        <span class="category-badge">${scenario.category}</span>
                    </div>
                </div>
            </div>
        `;
  }

  getIcon(iconName) {
    const icons = {
      "trending-up": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
      "trending-up-2": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>`,
      scissors: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12"/><path d="M20 4L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></svg>`,
      target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      "plus-circle": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
      clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`,
      "check-circle": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`,
    };

    return icons[iconName] || icons["check-circle"];
  }

  animateScenarios() {
    const scenarioCards =
      this.scenariosContainer.querySelectorAll(".scenario-card");
    scenarioCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px)";

      setTimeout(() => {
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 150);
    });
  }

  formatNumber(num) {
    return new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(num));
  }

  getScenarioById(id) {
    return this.scenarios.find((scenario) => scenario.id === id);
  }

  exportScenarios() {
    return this.scenarios.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      impact: scenario.impact,
      difficulty: scenario.difficulty,
      category: scenario.category,
    }));
  }

  clearScenarios() {
    if (this.scenariosContainer) {
      this.scenariosContainer.innerHTML = "";
    }
    this.scenarios = [];
  }

  generateChartDataForScenarios() {
    if (!this.currentData || this.scenarios.length === 0) return [];

    const { current, goal, roi } = this.currentData;
    const monthlyRate = roi / 100 / 12;
    const scenarioDatasets = [];

    // Color palette for scenarios
    const colors = [
      { border: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" }, // Green for savings boost
      { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }, // Orange for expense cut
      { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" }, // Blue for behavioral
      { border: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" }, // Purple for investment
      { border: "#10b981", bg: "rgba(16, 185, 129, 0.1)" }, // Teal for income
      { border: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" }, // Pink for timeline
    ];

    this.scenarios.forEach((scenario, index) => {
      const colorIndex = index % colors.length;
      const scenarioData = this.getScenarioChartData(scenario);

      if (scenarioData) {
        scenarioDatasets.push({
          label: `${scenario.title}`,
          data: scenarioData.balances,
          labels: scenarioData.labels,
          borderColor: colors[colorIndex].border,
          backgroundColor: colors[colorIndex].bg,
          borderDash: [3, 3],
          borderWidth: 2,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: colors[colorIndex].border,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 1,
          scenarioId: scenario.id,
          hidden: false, // Start with scenarios visible
        });
      }
    });

    return scenarioDatasets;
  }

  getScenarioChartData(scenario) {
    if (!this.currentData) return null;

    const { current, goal, roi } = this.currentData;
    let monthlyAmount,
      months,
      scenarioRoi = roi;

    // Determine scenario parameters based on scenario type
    switch (scenario.id) {
      case "10-percent-more":
        monthlyAmount = this.currentData.requiredMonthly * 1.1;
        months = this.calculateTimeToGoal(monthlyAmount, current, goal, roi);
        break;

      case "expense-reduction":
        const monthlyExpenses =
          this.currentData.totalIncome - this.currentData.availableIncome;
        monthlyAmount =
          this.currentData.requiredMonthly + monthlyExpenses * 0.1;
        months = this.calculateTimeToGoal(monthlyAmount, current, goal, roi);
        break;

      case "round-up":
        monthlyAmount = this.calculateRoundUpAmount(
          this.currentData.requiredMonthly,
        );
        months = this.calculateTimeToGoal(monthlyAmount, current, goal, roi);
        break;

      case "investment-boost":
        monthlyAmount = this.currentData.requiredMonthly;
        scenarioRoi = 4.0;
        months = this.calculateTimeToGoal(
          monthlyAmount,
          current,
          goal,
          scenarioRoi,
        );
        break;

      case "side-hustle":
        monthlyAmount = this.currentData.requiredMonthly + 250;
        months = this.calculateTimeToGoal(monthlyAmount, current, goal, roi);
        break;

      case "extend-timeline":
        months = this.currentData.months + 12;
        monthlyAmount = this.calculateRequiredMonthly(
          current,
          goal,
          months,
          roi,
        );
        break;

      default:
        return null;
    }

    if (months <= 0 || monthlyAmount <= 0) return null;

    // Generate chart data
    const monthlyRate = scenarioRoi / 100 / 12;
    const balances = this.calculateProjectedBalances(
      current,
      monthlyAmount,
      monthlyRate,
      Math.min(months, 120),
    ); // Cap at 10 years for display
    const labels = this.generateTimeLabels(balances.length - 1);

    return { balances, labels, months, monthlyAmount };
  }

  calculateRoundUpAmount(currentMonthly) {
    if (currentMonthly < 100) {
      return Math.ceil(currentMonthly / 25) * 25;
    } else if (currentMonthly < 500) {
      return Math.ceil(currentMonthly / 50) * 50;
    } else if (currentMonthly < 1000) {
      return Math.ceil(currentMonthly / 100) * 100;
    } else {
      return Math.ceil(currentMonthly / 250) * 250;
    }
  }

  calculateProjectedBalances(
    current,
    monthlyContribution,
    monthlyRate,
    months,
  ) {
    const balances = [current];
    let balance = current;

    for (let month = 1; month <= months; month++) {
      if (monthlyRate > 0) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
      } else {
        balance = balance + monthlyContribution;
      }
      balances.push(balance);
    }

    return balances;
  }

  generateTimeLabels(months) {
    const labels = ["Now"];

    for (let i = 1; i <= months; i++) {
      if (i <= 12) {
        labels.push(`${i}m`);
      } else {
        const years = Math.floor(i / 12);
        const remainingMonths = i % 12;
        if (remainingMonths === 0) {
          labels.push(`${years}y`);
        } else {
          labels.push(`${years}y${remainingMonths}m`);
        }
      }
    }

    return labels;
  }

  updateChartWithScenarios() {
    if (window.chartManager && window.chartManager.updateChartWithScenarios) {
      const scenarioDatasets = this.generateChartDataForScenarios();
      window.chartManager.updateChartWithScenarios(
        this.currentData,
        scenarioDatasets,
      );
    }
  }

  toggleScenarioOnChart(scenarioId, visible) {
    if (window.chartManager && window.chartManager.toggleScenarioVisibility) {
      window.chartManager.toggleScenarioVisibility(scenarioId, visible);
    }
  }
}

// Initialize scenarios manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.scenariosManager = new ScenariosManager();
});
