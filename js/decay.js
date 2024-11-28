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
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize date pickers
        this.initializeDatePickers();
    }

    bindEvents() {
        // Element selection changes
        this.elementSelect?.addEventListener('change', () => this.handleElementChange());
        
        // Isotope selection changes
        this.isotopeSelect?.addEventListener('change', () => this.handleIsotopeChange());
        
        // Calculate button
        document.getElementById('cmdCalculate')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.calculateDecay();
        });

        // Other isotope checkbox
        this.otherIsotopeCheckbox?.addEventListener('change', () => this.handleOtherIsotopeToggle());

        // Date picker buttons
        document.getElementById('cmdPickOrig')?.addEventListener('click', () => this.showDatePicker('original'));
        document.getElementById('cmdPickCalc')?.addEventListener('click', () => this.showDatePicker('calc'));
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

    showDatePicker(type) {
        const input = type === 'original' ? this.originalDateInput : this.calcDateInput;
        if (input) input.showPicker();
    }

    updateIsotopes(element) {
        if (!this.isotopeSelect) return;
        
        // Clear existing options
        this.isotopeSelect.innerHTML = '';
        
        // Get isotopes for selected element from data
        const isotopes = this.getIsotopesForElement(element);
        
        // Add new options
        isotopes.forEach(isotope => {
            const option = document.createElement('option');
            option.value = isotope.id;
            option.textContent = isotope.name;
            this.isotopeSelect.appendChild(option);
        });

        // Update half-life value
        this.updateHalfLife();
    }

    getIsotopesForElement(element) {
        // This would be replaced with actual isotope data
        return [
            { id: 'Ac-225', name: 'Ac-225', halfLife: 10 },
            { id: 'Ac-227', name: 'Ac-227', halfLife: 21.772 },
            { id: 'Ac-228', name: 'Ac-228', halfLife: 6.15 }
        ];
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

    calculateDecay() {
        try {
            // Get input values
            const halfLife = parseFloat(this.halfLifeInput?.value || '0');
            const originalActivity = parseFloat(this.originalActivityInput?.value || '0');
            const originalDate = this.originalDateInput?.value ? new Date(this.originalDateInput.value) : null;
            const calcDate = this.calcDateInput?.value ? new Date(this.calcDateInput.value) : null;
            
            // For calculation errors, use generic message
            if (isNaN(halfLife) || halfLife <= 0 || 
                isNaN(originalActivity) || originalActivity < 0 ||
                !originalDate || !calcDate || isNaN(originalDate.getTime()) || isNaN(calcDate.getTime())) {
                alert('Error calculating decay. Please check your inputs.');
                return;
            }

            // Calculate time difference in days
            const timeDiff = (calcDate - originalDate) / (1000 * 60 * 60 * 24);
            
            // Calculate decay
            const decayConstant = Math.LN2 / halfLife;
            const calculatedActivity = originalActivity * Math.exp(-decayConstant * timeDiff);
            
            // Display result
            if (this.calculatedActivityInput) {
                this.calculatedActivityInput.value = calculatedActivity.toFixed(3);
            }
            
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Error calculating decay. Please check your inputs.');
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
        if (!this.halfLifeInput || !this.isotopeSelect) return;
        
        const selectedIsotope = this.isotopeSelect.value;
        const isotopes = this.getIsotopesForElement(this.elementSelect?.value);
        const isotope = isotopes.find(iso => iso.id === selectedIsotope);
        
        if (isotope) {
            this.halfLifeInput.value = isotope.halfLife;
        }
    }
}

// Initialize calculator when DOM is loaded
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const calculator = new DecayCalculator();
    });
} 