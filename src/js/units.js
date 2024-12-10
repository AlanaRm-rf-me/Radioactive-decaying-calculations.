export const UNIT_CONVERSIONS = {
    'Bq': 1,
    'kBq': 1e3,
    'MBq': 1e6,
    'GBq': 1e9,
    'TBq': 1e12,
    'Ci': 3.7e10,
    'mCi': 3.7e7,
    'µCi': 3.7e4,
    'nCi': 37,
    'pCi': 0.037,
    'dpm': 1/60,
    'cpm': 1/60,
    'cps': 1
};

export function convertActivity(value, fromUnit, toUnit) {
    const valueInBq = value * UNIT_CONVERSIONS[fromUnit];
    return valueInBq / UNIT_CONVERSIONS[toUnit];
}

export function formatActivity(value, unit) {
    if (Math.abs(value) < 0.01 || Math.abs(value) >= 1e5) {
        return `${value.toExponential(3)} ${unit}`;
    }
    return `${value.toFixed(3)} ${unit}`;
}

export function getActivityLabel(unit) {
    return `Activity (${unit})`;
}
