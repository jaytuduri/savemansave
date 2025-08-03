/**
 * Chart Management Module for SavePlan Pro
 * Handles Chart.js integration and visualization of savings growth
 */

class ChartManager {
  constructor() {
    this.chart = null;
    this.chartElement = null;
    this.chartConfig = {
      type: "line",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                family: "Inter",
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: "Savings Growth Projection",
            font: {
              family: "Inter",
              size: 16,
              weight: "bold",
            },
            padding: 20,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e293b",
            bodyColor: "#64748b",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || "";
                const value = formatCurrency(context.parsed.y);
                return `${label}: ${value}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(148, 163, 184, 0.1)",
            },
            ticks: {
              font: {
                family: "Inter",
                size: 11,
              },
              color: "#64748b",
              callback: function (value) {
                return formatCurrency(value);
              },
            },
          },
          x: {
            grid: {
              color: "rgba(148, 163, 184, 0.1)",
            },
            ticks: {
              font: {
                family: "Inter",
                size: 11,
              },
              color: "#64748b",
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 8,
            borderWidth: 2,
          },
          line: {
            tension: 0.3,
            borderWidth: 3,
          },
        },
        animation: {
          duration: 1000,
          easing: "easeInOutCubic",
        },
      },
    };
    this.init();
  }

  init() {
    this.chartElement = document.getElementById("savingsChart");
    if (!this.chartElement) {
      console.warn("Chart canvas element not found");
      return;
    }

    // Initialize with empty chart
    this.createChart({
      goal: 1000000,
      current: 200000,
      months: 36,
      requiredMonthly: 22222,
      roi: 5,
    });
  }

  createChart(data) {
    if (!this.chartElement) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    const chartData = this.generateChartData(data);

    this.chart = new Chart(this.chartElement, {
      ...this.chartConfig,
      data: chartData,
    });
  }

  generateChartData(data) {
    const { goal, current, months, requiredMonthly, roi } = data;
    const monthlyRate = roi / 100 / 12;

    // Generate time labels
    const timeLabels = this.generateTimeLabels(months);

    // Calculate projected balances
    const projectedBalances = this.calculateProjectedBalances(
      current,
      requiredMonthly,
      monthlyRate,
      months,
    );

    // Calculate simple savings (without interest)
    const simpleSavings = this.calculateSimpleSavings(
      current,
      requiredMonthly,
      months,
    );

    // Goal line
    const goalLine = Array(months + 1).fill(goal);

    return {
      labels: timeLabels,
      datasets: [
        {
          label: "Projected Balance (with ROI)",
          data: projectedBalances,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          pointBackgroundColor: "#6366f1",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 8,
        },
        {
          label: "Simple Savings (no interest)",
          data: simpleSavings,
          borderColor: "#94a3b8",
          backgroundColor: "rgba(148, 163, 184, 0.05)",
          fill: false,
          borderDash: [5, 5],
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: "#94a3b8",
          pointBorderColor: "#ffffff",
        },
        {
          label: "Goal",
          data: goalLine,
          borderColor: "#10b981",
          backgroundColor: "transparent",
          borderDash: [10, 5],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
        },
      ],
    };
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

  calculateSimpleSavings(current, monthlyContribution, months) {
    const savings = [current];

    for (let month = 1; month <= months; month++) {
      savings.push(current + monthlyContribution * month);
    }

    return savings;
  }

  updateChart(data) {
    if (!this.chart) {
      this.createChart(data);
      return;
    }

    const newData = this.generateChartData(data);

    // Update chart data with animation
    this.chart.data = newData;
    this.chart.update("active");
  }

  updateChartWithScenarios(data, scenarioDatasets = []) {
    if (!this.chart) {
      this.createChart(data);
      return;
    }

    const baseData = this.generateChartData(data);

    // Add scenario datasets to the chart
    const allDatasets = [...baseData.datasets, ...scenarioDatasets];

    // Update chart with all datasets
    this.chart.data = {
      labels: baseData.labels,
      datasets: allDatasets,
    };

    this.chart.update("active");
  }

  toggleScenarioVisibility(scenarioId, visible) {
    if (!this.chart) return;

    const datasetIndex = this.chart.data.datasets.findIndex(
      (dataset) => dataset.scenarioId === scenarioId,
    );

    if (datasetIndex !== -1) {
      this.chart.data.datasets[datasetIndex].hidden = !visible;
      this.chart.update("none"); // Update without animation for toggle
    }
  }

  getChartImage() {
    if (!this.chart) return null;
    return this.chart.toBase64Image();
  }

  setTheme(isDark = false) {
    if (!this.chart) return;

    const textColor = isDark ? "#f1f5f9" : "#64748b";
    const gridColor = isDark
      ? "rgba(241, 245, 249, 0.1)"
      : "rgba(148, 163, 184, 0.1)";

    this.chart.options.scales.x.ticks.color = textColor;
    this.chart.options.scales.y.ticks.color = textColor;
    this.chart.options.scales.x.grid.color = gridColor;
    this.chart.options.scales.y.grid.color = gridColor;
    this.chart.options.plugins.legend.labels.color = textColor;
    this.chart.options.plugins.title.color = textColor;

    this.chart.update();
  }

  resize() {
    if (this.chart) {
      this.chart.resize();
    }
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  exportChartData(data) {
    const chartData = this.generateChartData(data);
    return {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
      })),
    };
  }

  highlightGoalIntersection(data) {
    if (!this.chart) return;

    const { goal, current, requiredMonthly, roi, months } = data;
    const monthlyRate = roi / 100 / 12;

    // Find when savings will reach the goal
    let balance = current;
    let intersectionMonth = null;

    for (let month = 1; month <= months; month++) {
      balance =
        monthlyRate > 0
          ? balance * (1 + monthlyRate) + requiredMonthly
          : balance + requiredMonthly;

      if (balance >= goal && intersectionMonth === null) {
        intersectionMonth = month;
        break;
      }
    }

    if (intersectionMonth !== null) {
      // Add annotation for goal achievement
      this.addGoalAnnotation(intersectionMonth, goal);
    }
  }

  addGoalAnnotation(month, goalAmount) {
    // This would require Chart.js annotation plugin
    // For now, we'll just log the information
    console.log(
      `Goal of ${formatCurrency(goalAmount)} reached at month ${month}`,
    );
  }

  getPerformanceMetrics(data) {
    const chartData = this.generateChartData(data);
    const projectedData = chartData.datasets[0].data;
    const simpleData = chartData.datasets[1].data;

    const finalProjected = projectedData[projectedData.length - 1];
    const finalSimple = simpleData[simpleData.length - 1];
    const interestBenefit = finalProjected - finalSimple;

    return {
      finalProjectedValue: finalProjected,
      finalSimpleValue: finalSimple,
      interestBenefit: interestBenefit,
      interestBenefitPercentage:
        finalSimple > 0 ? (interestBenefit / finalSimple) * 100 : 0,
    };
  }

  animateChartEntry() {
    if (!this.chart) return;

    this.chart.options.animation = {
      duration: 1500,
      easing: "easeInOutCubic",
      onComplete: () => {
        // Animation complete callback
        this.chart.options.animation.duration = 1000;
      },
    };
  }

  addScenarioToggleControls() {
    // This method can be called to add interactive controls
    // for toggling scenario visibility on the chart
    const chartContainer = this.chartElement?.parentElement;
    if (!chartContainer) return;

    let controlsContainer = chartContainer.querySelector(
      ".scenario-chart-controls",
    );
    if (!controlsContainer) {
      controlsContainer = document.createElement("div");
      controlsContainer.className = "scenario-chart-controls";
      controlsContainer.innerHTML = `
                <div class="chart-controls-header">
                    <span>Chart Options</span>
                </div>
                <div class="chart-controls-content">
                    <label class="chart-control-item">
                        <input type="checkbox" checked data-toggle="base-projection">
                        <span>Main Projection</span>
                    </label>
                    <label class="chart-control-item">
                        <input type="checkbox" checked data-toggle="scenarios">
                        <span>What-If Scenarios</span>
                    </label>
                </div>
            `;
      chartContainer.appendChild(controlsContainer);
    }
  }

  getVisibleScenarios() {
    if (!this.chart) return [];

    return this.chart.data.datasets
      .filter((dataset) => dataset.scenarioId && !dataset.hidden)
      .map((dataset) => ({
        id: dataset.scenarioId,
        label: dataset.label,
      }));
  }

  clearScenarios() {
    if (!this.chart) return;

    // Remove all scenario datasets (keep only base datasets)
    this.chart.data.datasets = this.chart.data.datasets.filter(
      (dataset) => !dataset.scenarioId,
    );

    this.chart.update("none");
  }
}

// Initialize chart manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait for Chart.js to be loaded
  if (typeof Chart !== "undefined") {
    window.chartManager = new ChartManager();
  } else {
    // Retry after a short delay if Chart.js isn't loaded yet
    setTimeout(() => {
      if (typeof Chart !== "undefined") {
        window.chartManager = new ChartManager();
      }
    }, 500);
  }
});

// Handle window resize
window.addEventListener(
  "resize",
  debounce(() => {
    if (window.chartManager) {
      window.chartManager.resize();
    }
  }, 250),
);
