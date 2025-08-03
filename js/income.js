/**
 * Income Management Module for SavePlan Pro
 * Handles multiple income earners, adding/removing earners, and income calculations
 */

class IncomeManager {
    constructor() {
        this.earnerCount = 1;
        this.isMultipleEarners = false;
        this.incomes = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateIncomeDisplay();
    }

    setupEventListeners() {
        // Listen for income input changes
        addEventListenerSafe('.income-input', 'input', (e) => {
            this.handleIncomeChange(e);
        });

        // Initialize first earner
        const firstInput = document.querySelector('.income-input');
        if (firstInput) {
            this.incomes.set(0, parseFloat(firstInput.value) || 0);
        }
    }

    handleIncomeChange(event) {
        const input = event.target;
        const earnerId = parseInt(input.dataset.earner);
        const value = parseFloat(input.value) || 0;

        this.incomes.set(earnerId, value);
        this.updateTotalIncome();

        // Trigger recalculation
        if (window.calculator && typeof window.calculator.calculate === 'function') {
            window.calculator.calculate();
        }
    }

    toggleMultipleEarners() {
        const toggle = document.getElementById('multipleEarnersToggle');
        const addBtn = document.getElementById('addEarnerBtn');

        this.isMultipleEarners = !this.isMultipleEarners;
        toggle.classList.toggle('active', this.isMultipleEarners);

        if (this.isMultipleEarners) {
            this.enableMultipleEarners();
            toggleElement(addBtn, true);
        } else {
            this.disableMultipleEarners();
            toggleElement(addBtn, false);
        }

        this.updateIncomeDisplay();
    }

    enableMultipleEarners() {
        const firstEarner = document.querySelector('.earner-title');
        if (firstEarner) {
            firstEarner.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Income Earner 1
            `;
        }
    }

    disableMultipleEarners() {
        // Remove additional earners
        const earners = document.querySelectorAll('.income-earner');
        earners.forEach((earner, index) => {
            if (index > 0) {
                const earnerId = parseInt(earner.dataset.earner);
                this.incomes.delete(earnerId);
                earner.remove();
            }
        });

        this.earnerCount = 1;

        // Reset first earner title
        const firstEarner = document.querySelector('.earner-title');
        if (firstEarner) {
            firstEarner.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Your Monthly Income
            `;
        }
    }

    addIncomeEarner() {
        const container = document.getElementById('incomeEarners');
        if (!container) return;

        const newEarner = this.createEarnerElement(this.earnerCount);
        container.appendChild(newEarner);

        // Initialize income for new earner
        this.incomes.set(this.earnerCount, 25000);
        this.earnerCount++;

        // Add event listener to new input
        const newInput = newEarner.querySelector('.income-input');
        if (newInput) {
            addEventListenerSafe(newInput, 'input', (e) => {
                this.handleIncomeChange(e);
            });
        }

        // Reinitialize icons
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }

        this.updateIncomeDisplay();
    }

    createEarnerElement(earnerId) {
        const newEarner = document.createElement('div');
        newEarner.className = 'income-earner';
        newEarner.setAttribute('data-earner', earnerId);

        newEarner.innerHTML = `
            <div class="earner-header">
                <div class="earner-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Income Earner ${earnerId + 1}
                </div>
                <button class="remove-earner" onclick="incomeManager.removeIncomeEarner(${earnerId})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>
            <div class="input-wrapper">
                <input type="number" class="income-input with-suffix" value="25000" data-earner="${earnerId}">
                <span class="input-suffix">SEK</span>
            </div>
        `;

        return newEarner;
    }

    removeIncomeEarner(earnerId) {
        const earner = document.querySelector(`[data-earner="${earnerId}"]`);
        if (earner) {
            this.incomes.delete(earnerId);
            earner.remove();
            this.updateIncomeDisplay();
        }
    }

    getAllIncomes() {
        return Array.from(this.incomes.values());
    }

    getTotalIncome() {
        return Array.from(this.incomes.values()).reduce((sum, income) => sum + income, 0);
    }

    updateTotalIncome() {
        const total = this.getTotalIncome();

        // Update household income display if it exists
        setElementText('householdIncome', formatCurrency(total));

        return total;
    }

    updateIncomeDisplay() {
        this.updateTotalIncome();

        // Trigger main calculation update
        if (window.calculator && typeof window.calculator.calculate === 'function') {
            window.calculator.calculate();
        }
    }

    getIncomeBreakdown() {
        const breakdown = [];
        this.incomes.forEach((income, earnerId) => {
            const earnerElement = document.querySelector(`[data-earner="${earnerId}"] .earner-title`);
            const title = earnerElement ? earnerElement.textContent.trim() : `Earner ${earnerId + 1}`;
            breakdown.push({
                id: earnerId,
                title: title,
                amount: income,
                percentage: this.getTotalIncome() > 0 ? (income / this.getTotalIncome()) * 100 : 0
            });
        });
        return breakdown;
    }

    setIncome(earnerId, amount) {
        this.incomes.set(earnerId, amount);

        // Update the corresponding input field
        const input = document.querySelector(`[data-earner="${earnerId}"] .income-input`);
        if (input) {
            input.value = amount;
        }

        this.updateIncomeDisplay();
    }

    reset() {
        // Reset to single earner mode
        this.isMultipleEarners = false;
        this.earnerCount = 1;
        this.incomes.clear();

        // Reset UI
        const toggle = document.getElementById('multipleEarnersToggle');
        const addBtn = document.getElementById('addEarnerBtn');

        if (toggle) toggle.classList.remove('active');
        if (addBtn) toggleElement(addBtn, false);

        // Remove all but first earner
        const earners = document.querySelectorAll('.income-earner');
        earners.forEach((earner, index) => {
            if (index > 0) {
                earner.remove();
            }
        });

        // Reset first earner
        const firstInput = document.querySelector('.income-input');
        if (firstInput) {
            firstInput.value = 39000;
            this.incomes.set(0, 39000);
        }

        this.disableMultipleEarners();
        this.updateIncomeDisplay();
    }

    validateIncomes() {
        const errors = [];

        this.incomes.forEach((income, earnerId) => {
            if (!isPositiveNumber(income)) {
                errors.push(`Income for earner ${earnerId + 1} must be a positive number`);
            }
        });

        if (this.getTotalIncome() === 0) {
            errors.push('Total income cannot be zero');
        }

        return errors;
    }

    exportData() {
        return {
            isMultipleEarners: this.isMultipleEarners,
            earnerCount: this.earnerCount,
            incomes: Object.fromEntries(this.incomes),
            totalIncome: this.getTotalIncome(),
            breakdown: this.getIncomeBreakdown()
        };
    }

    importData(data) {
        if (!data) return;

        this.reset();

        if (data.incomes) {
            Object.entries(data.incomes).forEach(([earnerId, income]) => {
                this.setIncome(parseInt(earnerId), income);
            });
        }

        if (data.isMultipleEarners && !this.isMultipleEarners) {
            this.toggleMultipleEarners();
        }
    }
}

// Global functions for HTML onclick handlers
function toggleMultipleEarners() {
    if (window.incomeManager) {
        window.incomeManager.toggleMultipleEarners();
    }
}

function addIncomeEarner() {
    if (window.incomeManager) {
        window.incomeManager.addIncomeEarner();
    }
}

// Initialize income manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.incomeManager = new IncomeManager();
});
