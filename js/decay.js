import { getAllElements, getIsotopesForElement, getIsotopeById, getHalfLifeInDays } from './isotopes.js';
import { convertActivity, formatActivity, getActivityLabel } from './units.js';
import { calculateDecayChain, getDecayChainIsotopes, getIsotopeColors } from './decay-chains.js';
import { createDecayTree, highlightDecayPosition } from './decay-tree.js';
import { DECAY_CHAINS } from './decay-chains.js';

export class DecayCalculator {
    constructor() {
        // Initialize calculator elements
        this.elementSelect = document.getElementById('cboElement');
        this.isotopeSelect = document.getElementById('cboIsotopes');
        this.halfLifeInput = document.getElementById('txtHLife');
        this.originalDateInput = document.getElementById('txtOrigDate');
        this.calcDateInput = document.getElementById('txtCalcDate');
        this.unitsSelect = document.getElementById('cboActivityUnits2');
        this.originalActivityInput = document.getElementById('txtOrigAct');
        this.calculatedActivityInput = document.getElementById('txtAnswer');
        this.otherIsotopeCheckbox = document.getElementById('chkOther');
        
        // Initialize elements dropdown
        this.initializeElements();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize date pickers and labels
        this.initializeDatePickers();
        this.updateActivityLabels();
        
        // Initialize chart and tabs
        this.chart = null;
        this.currentChartData = null;
        this.initializeTabs();
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update active content
                const tabId = button.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const activeTab = document.getElementById(`${tabId}-tab`);
                activeTab.classList.add('active');

                // If switching to chart tab, recreate the chart
                if (tabId === 'chart' && this.currentChartData) {
                    // Small delay to ensure the container is visible
                    setTimeout(() => {
                        this.createOrUpdateChart(this.currentChartData.results, this.currentChartData.unit);
                    }, 0);
                }
            });
        });
    }

    createOrUpdateChart(results, unit) {
        const ctx = document.getElementById('decayChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        // Get all isotopes in the chain
        const isotopes = Object.keys(results.activities);
        const colors = getIsotopeColors(isotopes);

        // Create datasets for each isotope
        const datasets = isotopes.map(isotope => ({
            label: isotope,
            data: results.activities[isotope],
            borderColor: colors[isotope],
            backgroundColor: colors[isotope] + '20',
            fill: true,
            tension: 0.4
        }));

        // Create the chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: results.timePoints.map(t => t.toFixed(1)),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Decay Chain Activity vs Time'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `${context.dataset.label}: ${value < 0.01 || value >= 1e5 ? value.toExponential(3) : value.toFixed(3)} ${unit}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (days)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: `Activity (${unit})`
                        },
                        type: 'logarithmic'
                    }
                }
            }
        });
    }

    calculateDecay() {
        try {
            // Get input values
            const halfLife = parseFloat(this.halfLifeInput?.value || '0');
            const originalActivity = parseFloat(this.originalActivityInput?.value || '0');
            const originalDate = this.originalDateInput?.value ? new Date(this.originalDateInput.value) : null;
            const calcDate = this.calcDateInput?.value ? new Date(this.calcDateInput.value) : null;
            const unit = this.unitsSelect?.value || 'cpm';
            
            // Validate inputs
            if (isNaN(halfLife) || halfLife <= 0 || 
                isNaN(originalActivity) || originalActivity < 0 ||
                !originalDate || !calcDate || isNaN(originalDate.getTime()) || isNaN(calcDate.getTime())) {
                alert('Error calculating decay. Please check your inputs.');
                return;
            }

            // Calculate time difference in days
            const timeDiff = (calcDate - originalDate) / (1000 * 60 * 60 * 24);
            
            // Generate time points for the chart (100 points)
            const timePoints = Array.from({length: 100}, (_, i) => i * (timeDiff / 99));
            
            // Get selected isotope
            const selectedIsotope = this.isotopeSelect?.value;
            
            // Calculate decay chain
            const chainResults = calculateDecayChain(originalActivity, selectedIsotope, timePoints);
            
            if (chainResults) {
                // Store the current chart data
                this.currentChartData = { results: chainResults, unit };

                // Update visualizations based on active tab
                const activeTab = document.querySelector('.tab-content.active');
                if (activeTab.id === 'chart-tab') {
                    this.createOrUpdateChart(chainResults, unit);
                }

                // Update the decay tree
                const treeContainer = document.getElementById('decay-tree');
                if (treeContainer) {
                    createDecayTree(treeContainer, selectedIsotope, DECAY_CHAINS);
                }

                // Update the result field with the final calculated activity
                const finalActivity = chainResults.activities[selectedIsotope][chainResults.timePoints.length - 1];
                if (this.calculatedActivityInput) {
                    if (Math.abs(finalActivity) < 0.01 || Math.abs(finalActivity) >= 1e5) {
                        this.calculatedActivityInput.value = finalActivity.toExponential(3);
                    } else {
                        this.calculatedActivityInput.value = finalActivity.toFixed(3);
                    }
                }

                // Update results panel
                const elapsed = Math.abs(timeDiff);
                const halfLivesElapsed = elapsed / halfLife;
                const activityRatio = (finalActivity/originalActivity) * 100;

                const resultsPanel = document.getElementById('results-panel');
                const timeElapsed = document.getElementById('time-elapsed');
                const decayConstantElem = document.getElementById('decay-constant');
                const activityRatioElem = document.getElementById('activity-ratio');

                if (resultsPanel && timeElapsed && decayConstantElem && activityRatioElem) {
                    timeElapsed.textContent = `Time elapsed: ${elapsed.toFixed(2)} days (${halfLivesElapsed.toFixed(2)} half-lives)`;
                    decayConstantElem.textContent = `Decay constant (λ): ${(Math.log(2)/halfLife).toExponential(3)} per day`;
                    activityRatioElem.textContent = `Activity reduced to ${activityRatio.toFixed(2)}% of original`;
                    resultsPanel.style.display = 'block';
                }
            }
            
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Error calculating decay. Please check your inputs.');
        }
    }

    initializeElements() {
        if (!this.elementSelect) return;

        // Clear existing options
        this.elementSelect.innerHTML = '';
        
        // Add elements to dropdown
        getAllElements().forEach(element => {
            const option = document.createElement('option');
            option.value = element;
            option.textContent = element;
            this.elementSelect.appendChild(option);
        });

        // Initialize isotopes for first element
        if (this.elementSelect.value) {
            this.updateIsotopes(this.elementSelect.value);
        }
    }

    bindEvents() {
        // Element selection changes
        this.elementSelect?.addEventListener('change', () => this.handleElementChange());
        
        // Isotope selection changes
        this.isotopeSelect?.addEventListener('change', () => this.handleIsotopeChange());
        
        // Calculate button
        document.getElementById('cmdCalculate')?.addEventListener('click', () => this.calculateDecay());

        // Other isotope checkbox
        this.otherIsotopeCheckbox?.addEventListener('change', () => this.handleOtherIsotopeToggle());

        // Units change
        this.unitsSelect?.addEventListener('change', () => this.updateActivityLabels());
    }

    initializeDatePickers() {
        // Convert existing date inputs to datetime-local
        if (this.originalDateInput) this.originalDateInput.type = 'datetime-local';
        if (this.calcDateInput) this.calcDateInput.type = 'datetime-local';
        
        // Set default values to current date/time
        const now = new Date();
        const dateString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
        if (this.calcDateInput) this.calcDateInput.value = dateString;
    }

    handleElementChange() {
        const selectedElement = this.elementSelect?.value;
        this.updateIsotopes(selectedElement);
    }

    handleIsotopeChange() {
        this.updateHalfLife();
    }

    updateIsotopes(element) {
        if (!this.isotopeSelect) return;
        
        // Clear existing options
        this.isotopeSelect.innerHTML = '';
        
        // Get isotopes for selected element
        const isotopes = getIsotopesForElement(element);
        
        // Add new options
        isotopes.forEach(isotope => {
            const option = document.createElement('option');
            option.value = isotope.id;
            option.textContent = `${isotope.name} (T₁/₂: ${isotope.halfLife} ${isotope.unit})`;
            this.isotopeSelect.appendChild(option);
        });

        // Update half-life value
        this.updateHalfLife();
    }

    handleOtherIsotopeToggle() {
        if (!this.otherIsotopeCheckbox) return;
        
        const isOtherSelected = this.otherIsotopeCheckbox.checked;
        
        // Enable/disable dropdowns based on checkbox
        if (this.elementSelect) this.elementSelect.disabled = isOtherSelected;
        if (this.isotopeSelect) this.isotopeSelect.disabled = isOtherSelected;
        
        // Clear or restore values as needed
        if (this.halfLifeInput) {
            if (isOtherSelected) {
                this.halfLifeInput.value = '';
                this.halfLifeInput.readOnly = false;
            } else {
                this.updateHalfLife();
                this.halfLifeInput.readOnly = true;
            }
        }
    }

    validateInputs(halfLife, originalActivity, originalDate, calcDate) {
        if (isNaN(halfLife) || halfLife <= 0) {
            alert('Please enter a valid half-life value.');
            return false;
        }
        
        if (isNaN(originalActivity) || originalActivity < 0) {
            alert('Please enter a valid original activity value.');
            return false;
        }
        
        if (!originalDate || !calcDate || 
            !(originalDate instanceof Date) || !(calcDate instanceof Date) ||
            isNaN(originalDate.getTime()) || isNaN(calcDate.getTime())) {
            alert('Please enter valid dates.');
            return false;
        }
        
        return true;
    }

    updateHalfLife() {
        if (!this.halfLifeInput || !this.isotopeSelect || !this.elementSelect) return;
        
        const selectedIsotope = this.isotopeSelect.value;
        const selectedElement = this.elementSelect.value;
        const isotope = getIsotopeById(selectedElement, selectedIsotope);
        
        if (isotope) {
            // Convert half-life to days for calculations
            const halfLifeInDays = getHalfLifeInDays(isotope.halfLife, isotope.unit);
            this.halfLifeInput.value = halfLifeInDays;
        }
    }

    updateActivityLabels() {
        const unit = this.unitsSelect?.value || 'cpm';
        const labels = document.querySelectorAll('label[for="txtOrigAct"], label[for="txtAnswer"]');
        labels.forEach(label => {
            label.textContent = getActivityLabel(unit);
        });
    }
}

// Create and export the calculator instance
export const calculator = new DecayCalculator();