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
                                branchingRatio: 1.0
                            }
                        ]
                    }
                ]
            }
        ]
    }
    // Add more decay chains as needed
};

export function convertToDays(value, unit) {
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
            return value / (24 * 60 * 60 * 1000000);
        default:
            throw new Error(`Unsupported time unit: ${unit}`);
    }
}

export function calculateDecayChain(initialActivity, isotope, timePoints) {
    if (!DECAY_CHAINS[isotope]) {
        return null;
    }

    const chain = DECAY_CHAINS[isotope];
    const activities = {};
    activities[isotope] = [];

    // Initialize activities for all daughters
    const daughters = getDecayChainIsotopes(isotope);
    daughters.forEach(daughter => {
        activities[daughter] = [];
    });

    // Calculate activities at each time point
    timePoints.forEach(t => {
        // Parent activity calculation with high precision
        const lambda1 = Math.log(2) / convertToDays(chain.halfLife, chain.unit);
        const parentActivity = initialActivity * Math.exp(-lambda1 * t);
        activities[isotope].push(parentActivity);

        // Calculate daughter activities with branching ratios
        let currentChain = chain;
        let currentActivity = parentActivity;
        let parentHalfLife = convertToDays(chain.halfLife, chain.unit);

        const processDaughters = (parentChain, parentAct, branchingRatio = 1.0) => {
            if (!parentChain.daughters) return;
            
            parentChain.daughters.forEach(daughter => {
                const daughterHalfLife = convertToDays(daughter.halfLife, daughter.unit);
                const daughterBranching = daughter.branchingRatio || 1.0;
                const totalBranching = branchingRatio * daughterBranching;
                
                const daughterActivity = calculateDaughterActivity(
                    parentAct,
                    parentHalfLife,
                    daughterHalfLife,
                    t
                ) * totalBranching;

                activities[daughter.isotope] = activities[daughter.isotope] || [];
                activities[daughter.isotope].push(daughterActivity);

                // Recursively process next generation
                processDaughters(daughter, daughterActivity, totalBranching);
            });
        };

        processDaughters(currentChain, currentActivity);
    });

    return {
        timePoints: timePoints,
        activities: activities
    };
}

function calculateDaughterActivity(N0, T1, T2, t) {
    // Use high precision arithmetic for very short half-lives
    const lambda1 = Math.log(2) / T1;
    const lambda2 = Math.log(2) / T2;
    
    // Handle special case where half-lives are very close
    if (Math.abs(lambda1 - lambda2) < 1e-10) {
        // Use Taylor series approximation for better precision
        return N0 * lambda1 * t * Math.exp(-lambda1 * t);
    }
    
    // Standard Bateman equation
    const term1 = lambda1 * lambda2 / (lambda2 - lambda1);
    const term2 = Math.exp(-lambda1 * t) - Math.exp(-lambda2 * t);
    return N0 * term1 * term2;
}

export function getDecayChainIsotopes(isotope) {
    const isotopes = new Set();
    
    function addDaughters(chain) {
        if (!chain || !chain.daughters) return;
        chain.daughters.forEach(daughter => {
            isotopes.add(daughter.isotope);
            addDaughters(DECAY_CHAINS[daughter.isotope]);
        });
    }
    
    const chain = DECAY_CHAINS[isotope];
    if (chain) {
        addDaughters(chain);
    }
    
    return Array.from(isotopes);
}

export function getIsotopeColors(isotopes) {
    const colors = {};
    const baseColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
    ];
    
    isotopes.forEach((isotope, index) => {
        colors[isotope] = baseColors[index % baseColors.length];
    });
    
    return colors;
}
