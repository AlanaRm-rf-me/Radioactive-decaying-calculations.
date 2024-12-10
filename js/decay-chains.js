// Decay chain data structure
export const DECAY_CHAINS = {
    "Ac-225": {
        halfLife: 10.0,
        unit: 'days',
        daughters: [
            {
                isotope: "Fr-221",
                halfLife: 4.9,
                unit: 'minutes',
                branchingRatio: 1.0,
                daughters: [
                    {
                        isotope: "At-217",
                        halfLife: 32.3,
                        unit: 'milliseconds',
                        branchingRatio: 1.0,
                        daughters: [
                            {
                                isotope: "Bi-213",
                                halfLife: 45.59,
                                unit: 'minutes',
                                branchingRatio: 1.0,
                                daughters: [
                                    {
                                        isotope: "Po-213",
                                        halfLife: 4.2,
                                        unit: 'microseconds',
                                        branchingRatio: 0.9784,
                                        daughters: [
                                            {
                                                isotope: "Pb-209",
                                                halfLife: 3.253,
                                                unit: 'hours',
                                                branchingRatio: 1.0,
                                                daughters: [
                                                    {
                                                        isotope: "Bi-209",
                                                        halfLife: Infinity,
                                                        unit: 'years',
                                                        branchingRatio: 1.0,
                                                        stable: true
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        isotope: "Tl-209",
                                        halfLife: 2.161,
                                        unit: 'minutes',
                                        branchingRatio: 0.0216,
                                        daughters: [
                                            {
                                                isotope: "Pb-209",
                                                halfLife: 3.253,
                                                unit: 'hours',
                                                branchingRatio: 1.0,
                                                daughters: [
                                                    {
                                                        isotope: "Bi-209",
                                                        halfLife: Infinity,
                                                        unit: 'years',
                                                        branchingRatio: 1.0,
                                                        stable: true
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
    // Add more decay chains here
};

// Convert all time units to days for calculations
function convertToDays(value, unit) {
    switch (unit.toLowerCase()) {
        case 'years':
            return value * 365.25;
        case 'days':
            return value;
        case 'hours':
            return value / 24;
        case 'minutes':
            return value / (24 * 60);
        case 'seconds':
            return value / (24 * 60 * 60);
        case 'milliseconds':
            return value / (24 * 60 * 60 * 1000);
        case 'microseconds':
            return value / (24 * 60 * 60 * 1000 * 1000);
        default:
            throw new Error(`Unknown time unit: ${unit}`);
    }
}

// Calculate activities for all isotopes in a decay chain at a given time
export function calculateDecayChain(initialActivity, isotope, timePoints) {
    const chain = DECAY_CHAINS[isotope];
    if (!chain) return null;

    const results = {
        timePoints,
        activities: {
            [isotope]: new Array(timePoints.length).fill(0)
        }
    };

    // Initialize with parent isotope
    const parentHalfLife = convertToDays(chain.halfLife, chain.unit);
    const parentLambda = Math.log(2) / parentHalfLife;

    // Calculate parent activity at each time point
    results.activities[isotope] = timePoints.map(t => 
        initialActivity * Math.exp(-parentLambda * t)
    );

    // Function to recursively calculate daughter products
    function calculateDaughter(parent, parentActivity, time, branchingRatio) {
        if (!parent.daughters) return;

        for (const daughter of parent.daughters) {
            const halfLife = convertToDays(daughter.halfLife, daughter.unit);
            if (halfLife === Infinity) continue; // Skip stable isotopes

            const lambda = Math.log(2) / halfLife;
            const activity = parentActivity * branchingRatio * 
                (lambda / (lambda - parentLambda)) * 
                (Math.exp(-parentLambda * time) - Math.exp(-lambda * time));

            if (!results.activities[daughter.isotope]) {
                results.activities[daughter.isotope] = new Array(timePoints.length).fill(0);
            }
            results.activities[daughter.isotope][timePoints.indexOf(time)] += activity;

            // Recursively calculate next generation
            calculateDaughter(daughter, activity, time, daughter.branchingRatio);
        }
    }

    // Calculate all daughters at each time point
    timePoints.forEach(t => {
        const parentActivity = results.activities[isotope][timePoints.indexOf(t)];
        chain.daughters.forEach(daughter => {
            calculateDaughter(chain, parentActivity, t, daughter.branchingRatio);
        });
    });

    return results;
}

// Get a list of all isotopes in a decay chain
export function getDecayChainIsotopes(isotope) {
    const chain = DECAY_CHAINS[isotope];
    if (!chain) return [];

    const isotopes = [isotope];

    function addDaughters(parent) {
        if (!parent.daughters) return;
        for (const daughter of parent.daughters) {
            isotopes.push(daughter.isotope);
            addDaughters(daughter);
        }
    }

    addDaughters(chain);
    return isotopes;
}

// Get a color for each isotope in the chain
export function getIsotopeColors(isotopes) {
    const colors = [
        '#4a90e2', // Parent (blue)
        '#e25c5c', // First daughter (red)
        '#50c878', // Second daughter (green)
        '#9b59b6', // Third daughter (purple)
        '#f1c40f', // Fourth daughter (yellow)
        '#e67e22', // Fifth daughter (orange)
        '#1abc9c', // Sixth daughter (turquoise)
        '#34495e'  // Seventh daughter (dark blue)
    ];

    const result = {};
    isotopes.forEach((isotope, index) => {
        result[isotope] = colors[index % colors.length];
    });
    return result;
} 