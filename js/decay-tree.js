// Function to create a visual representation of the decay chain
export function createDecayTree(parentElement, isotope, decayChains) {
    const chain = decayChains[isotope];
    if (!chain) return;

    // Clear existing content
    parentElement.innerHTML = '';
    parentElement.className = 'decay-tree';

    // Create the tree recursively
    function addIsotopeNode(parent, isotope, data, level = 0, isLast = true) {
        const container = document.createElement('div');
        container.className = 'isotope-container';
        container.style.marginLeft = `${level * 20}px`;

        const branch = document.createElement('div');
        branch.className = `branch ${isLast ? 'last' : ''}`;

        const node = document.createElement('div');
        node.className = 'isotope-node';
        
        const content = document.createElement('div');
        content.className = 'isotope-content';
        content.innerHTML = `
            <span class="isotope-name">${isotope}</span>
            <span class="half-life">T₁/₂: ${data.halfLife} ${data.unit}</span>
            ${data.branchingRatio ? `<span class="branching-ratio">(${(data.branchingRatio * 100).toFixed(1)}%)</span>` : ''}
        `;

        node.appendChild(content);
        container.appendChild(branch);
        container.appendChild(node);
        parent.appendChild(container);

        // Add daughter isotopes
        if (data.daughters) {
            const daughtersContainer = document.createElement('div');
            daughtersContainer.className = 'daughters-container';
            
            data.daughters.forEach((daughter, index) => {
                addIsotopeNode(
                    daughtersContainer, 
                    daughter.isotope, 
                    daughter, 
                    level + 1, 
                    index === data.daughters.length - 1
                );
            });
            
            parent.appendChild(daughtersContainer);
        }
    }

    // Start with the parent isotope
    addIsotopeNode(parentElement, isotope, chain);
}

// Function to highlight current position in decay chain
export function highlightDecayPosition(parentElement, isotope, activity) {
    // Remove existing highlights
    parentElement.querySelectorAll('.isotope-node').forEach(node => {
        node.classList.remove('active', 'decayed');
    });

    // Find the isotope node
    const isotopeNode = parentElement.querySelector(`[data-isotope="${isotope}"]`);
    if (isotopeNode) {
        isotopeNode.classList.add('active');
        
        // Mark previous isotopes as decayed
        let current = isotopeNode;
        while (current.previousElementSibling) {
            current = current.previousElementSibling;
            current.classList.add('decayed');
        }
    }
} 