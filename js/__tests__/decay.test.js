import { DecayCalculator } from '../decay.js';

// Mock DOM elements
beforeEach(() => {
    document.body.innerHTML = `
        <select id="cboElement"></select>
        <select id="cboIsotopes"></select>
        <input type="text" id="txtHLife" value="10">
        <input type="datetime-local" id="txtOrigDate">
        <input type="datetime-local" id="txtCalcDate">
        <select id="cboActivityUnits2"></select>
        <input type="text" id="txtOrigAct">
        <input type="text" id="txtAnswer">
        <input type="checkbox" id="chkOther">
        <button id="cmdCalculate">Calculate</button>
        <button id="cmdPickOrig">Pick Original</button>
        <button id="cmdPickCalc">Pick Calc</button>
    `;
});

describe('DecayCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new DecayCalculator();
    });

    describe('Initialization', () => {
        test('should properly initialize all DOM elements', () => {
            expect(calculator.elementSelect).toBeTruthy();
            expect(calculator.isotopeSelect).toBeTruthy();
            expect(calculator.halfLifeInput).toBeTruthy();
            expect(calculator.originalDateInput).toBeTruthy();
            expect(calculator.calcDateInput).toBeTruthy();
            expect(calculator.unitsSelect).toBeTruthy();
            expect(calculator.originalActivityInput).toBeTruthy();
            expect(calculator.calculatedActivityInput).toBeTruthy();
            expect(calculator.otherIsotopeCheckbox).toBeTruthy();
        });

        test('should set default date for calculation', () => {
            expect(calculator.calcDateInput.value).not.toBe('');
            expect(new Date(calculator.calcDateInput.value)).toBeInstanceOf(Date);
        });
    });

    describe('Input Validation', () => {
        test('should validate half-life value', () => {
            const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
            
            expect(calculator.validateInputs(-1, 100, new Date(), new Date())).toBe(false);
            expect(mockAlert).toHaveBeenCalledWith('Please enter a valid half-life value.');
            
            expect(calculator.validateInputs(0, 100, new Date(), new Date())).toBe(false);
            expect(calculator.validateInputs(10, 100, new Date(), new Date())).toBe(true);
            
            mockAlert.mockRestore();
        });

        test('should validate original activity', () => {
            const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
            
            expect(calculator.validateInputs(10, -1, new Date(), new Date())).toBe(false);
            expect(mockAlert).toHaveBeenCalledWith('Please enter a valid original activity value.');
            
            expect(calculator.validateInputs(10, 100, new Date(), new Date())).toBe(true);
            
            mockAlert.mockRestore();
        });

        test('should validate dates', () => {
            const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
            
            expect(calculator.validateInputs(10, 100, 'invalid', new Date())).toBe(false);
            expect(mockAlert).toHaveBeenCalledWith('Please enter valid dates.');
            
            expect(calculator.validateInputs(10, 100, new Date(), new Date())).toBe(true);
            
            mockAlert.mockRestore();
        });
    });

    describe('Decay Calculations', () => {
        test('should correctly calculate decay', () => {
            // Setup test data
            calculator.halfLifeInput.value = '10'; // 10 days half-life
            calculator.originalActivityInput.value = '100'; // 100 units initial activity
            
            const originalDate = new Date('2024-01-01');
            const calcDate = new Date('2024-01-11'); // 10 days later
            
            calculator.originalDateInput.value = originalDate.toISOString().slice(0, 16);
            calculator.calcDateInput.value = calcDate.toISOString().slice(0, 16);
            
            // Trigger calculation
            calculator.calculateDecay();
            
            // After one half-life (10 days), activity should be 50
            expect(parseFloat(calculator.calculatedActivityInput.value)).toBeCloseTo(50, 1);
        });

        test('should handle calculation errors', () => {
            const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
            
            // Setup invalid data
            calculator.halfLifeInput.value = 'invalid';
            calculator.calculateDecay();
            
            expect(mockAlert).toHaveBeenCalledWith('Error calculating decay. Please check your inputs.');
            
            mockConsoleError.mockRestore();
            mockAlert.mockRestore();
        });
    });

    describe('Isotope Handling', () => {
        test('should update isotopes when element changes', () => {
            const mockIsotopes = [
                { id: 'Test-1', name: 'Test-1', halfLife: 5 },
                { id: 'Test-2', name: 'Test-2', halfLife: 10 }
            ];
            
            jest.spyOn(calculator, 'getIsotopesForElement').mockReturnValue(mockIsotopes);
            
            calculator.handleElementChange();
            
            expect(calculator.isotopeSelect.children.length).toBe(2);
            expect(calculator.isotopeSelect.children[0].value).toBe('Test-1');
            expect(calculator.isotopeSelect.children[1].value).toBe('Test-2');
        });

        test('should handle other isotope toggle', () => {
            calculator.otherIsotopeCheckbox.checked = true;
            calculator.handleOtherIsotopeToggle();
            
            expect(calculator.elementSelect.disabled).toBe(true);
            expect(calculator.isotopeSelect.disabled).toBe(true);
            expect(calculator.halfLifeInput.readOnly).toBe(false);
            
            calculator.otherIsotopeCheckbox.checked = false;
            calculator.handleOtherIsotopeToggle();
            
            expect(calculator.elementSelect.disabled).toBe(false);
            expect(calculator.isotopeSelect.disabled).toBe(false);
            expect(calculator.halfLifeInput.readOnly).toBe(true);
        });
    });
}); 