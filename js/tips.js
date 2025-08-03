/**
 * Smart Tips Module for SavePlan Pro
 * Generates personalized financial advice based on user data
 */

class TipsManager {
    constructor() {
        this.tipsContainer = null;
        this.currentTips = [];
        this.init();
    }

    init() {
        this.tipsContainer = document.getElementById('tipsContainer');
        if (!this.tipsContainer) {
            console.warn('Tips container not found');
        }
    }

    generateTips(data) {
        const tips = [];
        const { savingsRate, surplus, months, roi, goal, current, totalIncome, availableIncome, requiredMonthly } = data;

        // Savings Rate Analysis
        if (savingsRate > 50) {
            tips.push({
                type: 'warning',
                icon: this.getIcon('alert-triangle'),
                title: 'High Savings Rate',
                text: 'Your savings rate is very high (>50%). While admirable, ensure this is sustainable long-term and doesn\'t compromise your quality of life.',
                priority: 8
            });
        } else if (savingsRate > 30) {
            tips.push({
                type: 'success',
                icon: this.getIcon('trending-up'),
                title: 'Excellent Savings Rate',
                text: 'Your savings rate is excellent! You\'re on track for strong financial security.',
                priority: 5
            });
        } else if (savingsRate < 10) {
            tips.push({
                type: 'warning',
                icon: this.getIcon('trending-down'),
                title: 'Low Savings Rate',
                text: 'Consider increasing your savings rate to at least 10-20% for better financial health and emergency preparedness.',
                priority: 9
            });
        }

        // Budget Feasibility
        if (surplus < 0) {
            tips.push({
                type: 'danger',
                icon: this.getIcon('alert-circle'),
                title: 'Budget Deficit',
                text: 'Your goal requires more than your available income. Consider extending your timeframe, reducing the goal amount, or increasing income.',
                priority: 10
            });
        } else if (surplus < 5000) {
            tips.push({
                type: 'warning',
                icon: this.getIcon('zap'),
                title: 'Tight Budget',
                text: 'You\'ll have limited funds for emergencies. Consider building an emergency buffer or extending your savings timeline.',
                priority: 7
            });
        } else if (surplus > totalIncome * 0.3) {
            tips.push({
                type: 'info',
                icon: this.getIcon('dollar-sign'),
                title: 'Room for Growth',
                text: 'You have significant surplus income. Consider increasing your goal or diversifying into additional investments.',
                priority: 4
            });
        }

        // ROI Analysis
        if (roi < 2) {
            tips.push({
                type: 'info',
                icon: this.getIcon('trending-up'),
                title: 'Conservative Returns',
                text: 'Your expected ROI is quite conservative. Consider diversifying into higher-yield options like index funds or ETFs for potentially better returns.',
                priority: 6
            });
        } else if (roi > 8) {
            tips.push({
                type: 'warning',
                icon: this.getIcon('bar-chart'),
                title: 'High ROI Expectations',
                text: 'An 8%+ ROI carries significant risk. Ensure you\'re comfortable with potential volatility and consider diversification.',
                priority: 7
            });
        } else if (roi >= 4 && roi <= 7) {
            tips.push({
                type: 'success',
                icon: this.getIcon('check-circle'),
                title: 'Balanced ROI',
                text: 'Your ROI expectations are realistic for a diversified portfolio. Consider index funds or balanced mutual funds.',
                priority: 3
            });
        }

        // Timeline Analysis
        if (months > 60) {
            tips.push({
                type: 'info',
                icon: this.getIcon('clock'),
                title: 'Long-term Goal',
                text: 'Long-term goals benefit significantly from compound growth. Stay consistent with contributions and consider automatic investing.',
                priority: 5
            });
        } else if (months < 12) {
            tips.push({
                type: 'warning',
                icon: this.getIcon('fast-forward'),
                title: 'Aggressive Timeline',
                text: 'Your timeline is very aggressive. Consider if this is realistic or if extending the timeframe might reduce financial stress.',
                priority: 8
            });
        }

        // Emergency Fund Recommendations
        const monthlyExpenses = totalIncome - availableIncome;
        const emergencyFundTarget = monthlyExpenses * 6;

        if (current < emergencyFundTarget) {
            tips.push({
                type: 'info',
                icon: this.getIcon('shield'),
                title: 'Emergency Fund',
                text: `Consider building an emergency fund of ${formatCurrency(emergencyFundTarget)} (6 months of expenses) before pursuing this goal.`,
                priority: 6
            });
        }

        // Automation Tips
        tips.push({
            type: 'info',
            icon: this.getIcon('repeat'),
            title: 'Automate Your Savings',
            text: 'Set up automatic transfers to your savings account right after payday to ensure consistent progress toward your goal.',
            priority: 3
        });

        // Regular Review
        tips.push({
            type: 'info',
            icon: this.getIcon('refresh-cw'),
            title: 'Regular Reviews',
            text: 'Review and adjust your plan quarterly. Life changes, and your financial plan should adapt accordingly.',
            priority: 2
        });

        // Progress Tracking
        const progressPercentage = (current / goal) * 100;
        if (progressPercentage > 75) {
            tips.push({
                type: 'success',
                icon: this.getIcon('star'),
                title: 'Almost There!',
                text: 'You\'re in the final stretch! Consider what your next financial goal will be after achieving this one.',
                priority: 4
            });
        } else if (progressPercentage > 50) {
            tips.push({
                type: 'success',
                icon: this.getIcon('trending-up'),
                title: 'Great Progress',
                text: 'You\'re over halfway to your goal! Keep up the momentum and stay focused on your target.',
                priority: 4
            });
        }

        // Tax Optimization
        if (requiredMonthly > 5000) {
            tips.push({
                type: 'info',
                icon: this.getIcon('calculator'),
                title: 'Tax Optimization',
                text: 'With significant monthly savings, consider tax-advantaged accounts like ISK, KF, or pension savings for better after-tax returns.',
                priority: 5
            });
        }

        // Diversification
        if (goal > 500000) {
            tips.push({
                type: 'info',
                icon: this.getIcon('pie-chart'),
                title: 'Diversification',
                text: 'For large goals, consider diversifying across different asset classes: stocks, bonds, real estate, and international markets.',
                priority: 4
            });
        }

        // Side Income Suggestions
        if (surplus < requiredMonthly * 0.2) {
            tips.push({
                type: 'info',
                icon: this.getIcon('plus-circle'),
                title: 'Additional Income',
                text: 'Consider side income opportunities: freelancing, part-time work, or passive income streams to accelerate your progress.',
                priority: 6
            });
        }

        // Sort tips by priority (highest first) and take top 5-7
        this.currentTips = tips
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 7);

        this.displayTips();
        return this.currentTips;
    }

    displayTips() {
        if (!this.tipsContainer) return;

        const tipsHTML = this.currentTips.map(tip => this.createTipHTML(tip)).join('');
        this.tipsContainer.innerHTML = tipsHTML;

        // Add animation
        this.animateTips();
    }

    createTipHTML(tip) {
        const typeClasses = {
            success: 'tip-success',
            warning: 'tip-warning',
            danger: 'tip-danger',
            info: 'tip-info'
        };

        return `
            <div class="tip-item ${typeClasses[tip.type] || 'tip-info'}" data-tip-type="${tip.type}">
                <div class="tip-icon">
                    ${tip.icon}
                </div>
                <div class="tip-content">
                    <div class="tip-title">${tip.title}</div>
                    <div class="tip-text">${tip.text}</div>
                </div>
            </div>
        `;
    }

    getIcon(iconName) {
        const icons = {
            'alert-triangle': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/></svg>`,
            'trending-up': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>`,
            'trending-down': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>`,
            'alert-circle': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
            'zap': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
            'dollar-sign': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
            'bar-chart': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
            'check-circle': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`,
            'clock': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`,
            'fast-forward': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,19 22,12 13,5"/><polygon points="2,19 11,12 2,5"/></svg>`,
            'shield': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
            'repeat': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
            'refresh-cw': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
            'star': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,
            'calculator': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`,
            'pie-chart': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
            'plus-circle': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`
        };

        return icons[iconName] || icons['check-circle'];
    }

    animateTips() {
        const tipItems = this.tipsContainer.querySelectorAll('.tip-item');
        tipItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';

            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    addCustomTip(tip) {
        this.currentTips.unshift(tip);
        this.displayTips();
    }

    clearTips() {
        if (this.tipsContainer) {
            this.tipsContainer.innerHTML = '';
        }
        this.currentTips = [];
    }

    exportTips() {
        return this.currentTips.map(tip => ({
            type: tip.type,
            title: tip.title,
            text: tip.text,
            priority: tip.priority
        }));
    }

    getTipsByType(type) {
        return this.currentTips.filter(tip => tip.type === type);
    }

    getHighPriorityTips(minPriority = 7) {
        return this.currentTips.filter(tip => tip.priority >= minPriority);
    }
}

// Initialize tips manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tipsManager = new TipsManager();
});

// Add some additional CSS for tip styling
const additionalStyles = `
    .tip-success {
        border-left: 4px solid #10b981;
    }

    .tip-warning {
        border-left: 4px solid #f59e0b;
    }

    .tip-danger {
        border-left: 4px solid #ef4444;
    }

    .tip-info {
        border-left: 4px solid #6366f1;
    }

    .tip-content {
        flex: 1;
    }

    .tip-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: #92400e;
    }

    .tip-text {
        font-size: 0.9rem;
        line-height: 1.4;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
