export const ISOTOPE_DATA = {
    "Actinium (Ac)": [
        { id: 'Ac-225', name: 'Ac-225', halfLife: 10.0, unit: 'days' },
        { id: 'Ac-227', name: 'Ac-227', halfLife: 21.772, unit: 'years' },
        { id: 'Ac-228', name: 'Ac-228', halfLife: 6.15, unit: 'hours' }
    ],
    "Americium (Am)": [
        { id: 'Am-241', name: 'Am-241', halfLife: 432.2, unit: 'years' },
        { id: 'Am-243', name: 'Am-243', halfLife: 7370, unit: 'years' }
    ],
    "Antimony (Sb)": [
        { id: 'Sb-122', name: 'Sb-122', halfLife: 2.7238, unit: 'days' },
        { id: 'Sb-124', name: 'Sb-124', halfLife: 60.20, unit: 'days' },
        { id: 'Sb-125', name: 'Sb-125', halfLife: 2.75856, unit: 'years' }
    ],
    "Beryllium (Be)": [
        { id: 'Be-7', name: 'Be-7', halfLife: 53.22, unit: 'days' },
        { id: 'Be-10', name: 'Be-10', halfLife: 1.387e6, unit: 'years' }
    ]
};

export function getHalfLifeInDays(halfLife, unit) {
    switch (unit.toLowerCase()) {
        case 'years':
            return halfLife * 365.25;
        case 'days':
            return halfLife;
        case 'hours':
            return halfLife / 24;
        case 'minutes':
            return halfLife / (24 * 60);
        case 'seconds':
            return halfLife / (24 * 60 * 60);
        case 'milliseconds':
            return halfLife / (24 * 60 * 60 * 1000);
        case 'microseconds':
            return halfLife / (24 * 60 * 60 * 1000000);
        default:
            throw new Error(`Unsupported time unit: ${unit}`);
    }
}

export function getAllElements() {
    return Object.keys(ISOTOPE_DATA);
}

export function getIsotopesForElement(element) {
    return ISOTOPE_DATA[element] || [];
}

export function getIsotopeById(element, isotopeId) {
    const isotopes = getIsotopesForElement(element);
    return isotopes.find(isotope => isotope.id === isotopeId);
}

export function formatHalfLife(halfLife, unit) {
    return `${halfLife} ${unit}`;
}
