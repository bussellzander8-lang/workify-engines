// Game State
let engine = {
    parts: [],
    power: 0,
    efficiency: 0
};

// Part Stats
const partStats = {
    piston: { power: 10, efficiency: 5 },
    cylinder: { power: 15, efficiency: 8 },
    crankshaft: { power: 20, efficiency: 10 },
    "fuel-injector": { power: 5, efficiency: 15 },
    "spark-plug": { power: 8, efficiency: 12 },
    valve: { power: 3, efficiency: 10 }
};

const partNames = {
    piston: "🔩 Piston",
    cylinder: "🔲 Cylinder",
    crankshaft: "↻ Crankshaft",
    "fuel-injector": "💧 Fuel Injector",
    "spark-plug": "⚡ Spark Plug",
    valve: "🚪 Valve"
};

// DOM Elements
const engineCanvas = document.getElementById("engineCanvas");
const testButton = document.getElementById("testButton");
const clearButton = document.getElementById("clearButton");
const partElements = document.querySelectorAll(".part");

// Initialize Drag & Drop
partElements.forEach(part => {
    part.addEventListener("dragstart", handleDragStart);
});

engineCanvas.addEventListener("dragover", handleDragOver);
engineCanvas.addEventListener("drop", handleDrop);
engineCanvas.addEventListener("dragleave", handleDragLeave);

let draggedPart = null;

function handleDragStart(e) {
    draggedPart = e.target.getAttribute("data-type");
    e.dataTransfer.effectAllowed = "copy";
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    engineCanvas.classList.add("dragover");
}

function handleDragLeave(e) {
    if (e.target === engineCanvas) {
        engineCanvas.classList.remove("dragover");
    }
}

function handleDrop(e) {
    e.preventDefault();
    engineCanvas.classList.remove("dragover");

    if (draggedPart && engine.parts.length < 10) {
        addPartToEngine(draggedPart);
    }
}

function addPartToEngine(partType) {
    engine.parts.push(partType);
    updateEngineDisplay();
    updateStats();
}

function updateEngineDisplay() {
    // Clear existing parts
    const existingParts = engineCanvas.querySelectorAll(".placed-part");
    existingParts.forEach(part => part.remove());

    // Remove placeholder text if exists
    const placeholder = engineCanvas.querySelector("p");
    if (placeholder) placeholder.remove();

    // Add parts
    engine.parts.forEach((partType, index) => {
        const partElement = document.createElement("div");
        partElement.className = "placed-part";
        partElement.textContent = partNames[partType];
        partElement.onclick = () => removePartFromEngine(index);
        partElement.title = "Click to remove";
        engineCanvas.appendChild(partElement);
    });

    // Show placeholder if empty
    if (engine.parts.length === 0) {
        const placeholder = document.createElement("p");
        placeholder.style.color = "#999";
        placeholder.textContent = "Drag parts here to build your engine";
        engineCanvas.appendChild(placeholder);
    }
}

function removePartFromEngine(index) {
    engine.parts.splice(index, 1);
    updateEngineDisplay();
    updateStats();
}

function updateStats() {
    let totalPower = 0;
    let totalEfficiency = 0;

    engine.parts.forEach(partType => {
        const stats = partStats[partType];
        totalPower += stats.power;
        totalEfficiency += stats.efficiency;
    });

    // Average efficiency
    const avgEfficiency = engine.parts.length > 0 
        ? Math.round(totalEfficiency / engine.parts.length) 
        : 0;

    engine.power = totalPower;
    engine.efficiency = avgEfficiency;

    // Update UI
    document.getElementById("powerStat").textContent = `${totalPower} HP`;
    document.getElementById("efficiencyStat").textContent = `${avgEfficiency}%`;
    document.getElementById("partCountStat").textContent = `${engine.parts.length}/10`;

    // Update car status
    const carStatus = document.getElementById("carStatus");
    if (engine.parts.length === 0) {
        carStatus.textContent = "Attach an engine to your car!";
        carStatus.style.color = "#999";
    } else if (engine.parts.length < 3) {
        carStatus.textContent = "⚠️ Engine needs more parts";
        carStatus.style.color = "#f39c12";
    } else {
        carStatus.textContent = `✅ Engine Ready! (${engine.power} HP)`;
        carStatus.style.color = "#2ecc71";
    }
}

// Test Button
testButton.addEventListener("click", () => {
    if (engine.parts.length < 3) {
        alert("❌ Your engine needs at least 3 parts to test!");
    } else {
        const message = `
🧪 ENGINE TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━
⚙️  Parts: ${engine.parts.length}/10
💪 Power: ${engine.power} HP
⚡ Efficiency: ${engine.efficiency}%
🏎️  Car Status: Ready to drive!
━━━━━━━━━━━━━━━━━━━━━━
Great engine! Keep building!`;
        alert(message);
    }
});

// Clear Button
clearButton.addEventListener("click", () => {
    if (confirm("🗑️ Clear all parts? This cannot be undone!")) {
        engine.parts = [];
        updateEngineDisplay();
        updateStats();
    }
});

// Initialize
updateEngineDisplay();
updateStats();
