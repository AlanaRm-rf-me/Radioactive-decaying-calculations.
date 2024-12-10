// Conversion factors to Becquerel (Bq)
export const UNIT_CONVERSIONS = {
    // SI units
    'Bq': 1,
    'kBq': 1e3,
    'MBq': 1e6,
    'GBq': 1e9,
    'TBq': 1e12,
    
    // Traditional units
    'Ci': 3.7e10,    // 1 Ci = 3.7×10¹⁰ Bq
    'mCi': 3.7e7,    // 1 mCi = 3.7×10⁷ Bq
    'µCi': 3.7e4,    // 1 µCi = 3.7×10⁴ Bq
    'nCi': 37,       // 1 nCi = 37 Bq
    'pCi': 0.037,    // 1 pCi = 0.037 Bq
    
    // Count-based units (approximate, using typical detector efficiency)
    'dpm': 1/60,     // 1 Bq = 60 dpm
    'cpm': 1/60,     // Assuming 100% efficiency for simplicity
    'cps': 1         // 1 Bq = 1 cps (assuming 100% efficiency)
};

// Convert activity from one unit to another
export function convertActivity(value, fromUnit, toUnit) {
    // Convert to Bq first
    const valueInBq = value * UNIT_CONVERSIONS[fromUnit];
    // Then convert to target unit
    return valueInBq / UNIT_CONVERSIONS[toUnit];
}

// Format activity value for display
export function formatActivity(value, unit) {
    if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e5) {
        return `${value.toExponential(3)} ${unit}`;
    }
    return `${value.toFixed(3)} ${unit}`;
}

// Update activity label based on selected unit
export function getActivityLabel(unit) {
    return `Activity (${unit})`;
} 