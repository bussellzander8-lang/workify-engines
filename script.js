// ============================================
// WORKIFY ENGINES - Complete Game Engine
// ============================================

// Game State Management
let engine = {
    parts: [],
    power: 0,
    efficiency: 0,
    totalCost: 0
};

let gameStats = {
    enginesTested: 0,
    bestPower: 0,
    bestEfficiency: 0,
    totalPartsUsed: 0
};

// Part Stats with costs
const partStats = {
    piston: { 
        power: 10, 
        efficiency: 5, 
        cost: 50,
        description: "Basic component that converts combustion into motion"
    },
    cylinder: { 
        power: 15, 
        efficiency: 8, 
        cost: 75,
        description: "Contains the combustion chamber"
    },
    crankshaft: { 
        power: 20, 
        efficiency: 10, 
        cost: 150,
        description: "Converts linear motion to rotational motion"
    },
    "fuel-injector": { 
        power: 5, 
        efficiency: 15, 
        cost: 100,
        description: "Improves fuel efficiency and delivery"
    },
    "spark-plug": { 
        power: 8, 
        efficiency: 12, 
        cost: 40,
        description: "Creates the spark for combustion"
    },
    valve: { 
        power: 3, 
        efficiency: 10, 
        cost: 30,
        description: "Controls air and fuel flow"
    },
    turbo: {
        power: 35,
        efficiency: 5,
        cost: 250,
        description: "Boosts engine power significantly"
    },
    cooler: {
        power: 0,
        efficiency: 20,
        cost: 120,
        description: "Keeps engine cool and efficient"
    }
};

const partNames = {
    piston: "🔩 Piston",
    cylinder: "🔲 Cylinder",
    crankshaft: "↻ Crankshaft",
    "fuel-injector": "💧 Fuel Injector",
    "spark-plug": "⚡ Spark Plug",
    valve: "🚪 Valve",
    turbo: "🌪️ Turbo",
    cooler: "❄️ Cooler"
};

// Part Limits
const partLimits = {
    piston: 4,
    cylinder: 2,
    crankshaft: 1,
    "fuel-injector": 2,
    "spark-plug": 2,
    valve: 3,
    turbo: 1,
    cooler: 1
};

// DOM Elements
const engineCanvas = document.getElementById("engineCanvas");
const testButton = document.getElementById("testButton");
const clearButton = document.getElementById("clearButton");
const partElements = document.querySelectorAll(".part");

// Initialize Drag & Drop
partElements.forEach(part => {
    part.addEventListener("dragstart", handleDragStart);
    part.addEventListener("dragend", handleDragEnd);
    part.addEventListener("mouseenter", showPartTooltip);
    part.addEventListener("mouseleave", hidePartTooltip);
});

engineCanvas.addEventListener("dragover", handleDragOver);
engineCanvas.addEventListener("drop", handleDrop);
engineCanvas.addEventListener("dragleave", handleDragLeave);

let draggedPart = null;
let draggedElement = null;

// ============================================
// DRAG & DROP HANDLERS
// ============================================

function handleDragStart(e) {
    draggedPart = e.currentTarget.getAttribute("data-type");
    draggedElement = e.currentTarget;
    e.dataTransfer.effectAllowed = "copy";
    e.currentTarget.style.opacity = "0.6";
}

function handleDragEnd(e) {
    e.currentTarget.style.opacity = "1";
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

    if (draggedPart) {
        const currentCount = engine.parts.filter(p => p === draggedPart).length;
        const limit = partLimits[draggedPart];
        
        if (currentCount >= limit) {
            showNotification(`❌ Cannot add more ${partNames[draggedPart]}! (Max: ${limit})`);
            return;
        }
        
        if (engine.parts.length < 10) {
            addPartToEngine(draggedPart);
            showNotification(`✅ Added ${partNames[draggedPart]}`);
        } else {
            showNotification("❌ Engine is full! (Max: 10 parts)");
        }
    }
}

// ============================================
// PART MANAGEMENT
// ============================================

function addPartToEngine(partType) {
    engine.parts.push(partType);
    updateEngineDisplay();
    updateStats();
    saveEngineToLocalStorage();
}

function removePartFromEngine(index) {
    const removedPart = engine.parts[index];
    engine.parts.splice(index, 1);
    updateEngineDisplay();
    updateStats();
    saveEngineToLocalStorage();
    showNotification(`🗑️ Removed ${partNames[removedPart]}`);
}

function updateEngineDisplay() {
    const existingParts = engineCanvas.querySelectorAll(".placed-part");
    existingParts.forEach(part => part.remove());

    const placeholder = engineCanvas.querySelector("p");
    if (placeholder) placeholder.remove();

    engine.parts.forEach((partType, index) => {
        const partElement = document.createElement("div");
        partElement.className = "placed-part";
        partElement.textContent = partNames[partType];
        partElement.onclick = () => removePartFromEngine(index);
        partElement.title = `Click to remove - ${partStats[partType].description}`;
        engineCanvas.appendChild(partElement);
    });

    if (engine.parts.length === 0) {
        const placeholder = document.createElement("p");
        placeholder.style.color = "#999";
        placeholder.textContent = "Drag parts here to build your engine";
        engineCanvas.appendChild(placeholder);
    }
}

// ============================================
// STATISTICS & CALCULATIONS
// ============================================

function updateStats() {
    let totalPower = 0;
    let totalEfficiency = 0;
    let totalCost = 0;

    engine.parts.forEach(partType => {
        const stats = partStats[partType];
        totalPower += stats.power;
        totalEfficiency += stats.efficiency;
        totalCost += stats.cost;
    });

    const avgEfficiency = engine.parts.length > 0 
        ? Math.round(totalEfficiency / engine.parts.length) 
        : 0;

    engine.power = totalPower;
    engine.efficiency = avgEfficiency;
    engine.totalCost = totalCost;

    document.getElementById("powerStat").textContent = `${totalPower} HP`;
    document.getElementById("efficiencyStat").textContent = `${avgEfficiency}%`;
    document.getElementById("partCountStat").textContent = `${engine.parts.length}/10`;
    
    const costElement = document.getElementById("costStat");
    if (costElement) {
        costElement.textContent = `$${totalCost}`;
    }

    const carStatus = document.getElementById("carStatus");
    if (engine.parts.length === 0) {
        carStatus.textContent = "Attach an engine to your car!";
        carStatus.style.color = "#999";
    } else if (engine.parts.length < 3) {
        carStatus.textContent = "⚠️ Engine needs more parts";
        carStatus.style.color = "#f39c12";
    } else if (engine.power < 20) {
        carStatus.textContent = "🐢 Slow but efficient";
        carStatus.style.color = "#3498db";
    } else if (engine.power < 50) {
        carStatus.textContent = "⚡ Balanced engine!";
        carStatus.style.color = "#2ecc71";
    } else {
        carStatus.textContent = `🏎️ BEAST MODE! (${engine.power} HP)`;
        carStatus.style.color = "#e74c3c";
    }
}

// ============================================
// TEST ENGINE
// ============================================

function testEngine() {
    if (engine.parts.length < 3) {
        showNotification("❌ Your engine needs at least 3 parts to test!");
        return;
    }

    const performance = calculateEnginePerformance();
    
    gameStats.enginesTested++;
    gameStats.totalPartsUsed += engine.parts.length;
    
    if (engine.power > gameStats.bestPower) {
        gameStats.bestPower = engine.power;
    }
    if (engine.efficiency > gameStats.bestEfficiency) {
        gameStats.bestEfficiency = engine.efficiency;
    }
    
    saveStatsToLocalStorage();

    const message = `
🧪 ENGINE TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  Parts Used: ${engine.parts.length}/10
💪 Power Output: ${engine.power} HP
⚡ Efficiency: ${engine.efficiency}%
💰 Cost: $${engine.totalCost}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PERFORMANCE RATING: ${performance.rating}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests Conducted: ${gameStats.enginesTested}
Best Power: ${gameStats.bestPower} HP
Best Efficiency: ${gameStats.bestEfficiency}%`;
    
    alert(message);
}

function calculateEnginePerformance() {
    let rating = "F";
    const score = (engine.power * 0.6) + (engine.efficiency * 0.4);
    
    if (score >= 100) rating = "S (LEGENDARY)";
    else if (score >= 80) rating = "A (EXCELLENT)";
    else if (score >= 60) rating = "B (GOOD)";
    else if (score >= 40) rating = "C (FAIR)";
    else if (score >= 20) rating = "D (POOR)";
    
    return { rating, score };
}

// ============================================
// UI HELPERS
// ============================================

function showPartTooltip(e) {
    const partType = e.currentTarget.getAttribute("data-type");
    if (!partStats[partType]) return;
    
    const stats = partStats[partType];
    
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerHTML = `
        <strong>${partNames[partType]}</strong><br>
        Power: +${stats.power}<br>
        Efficiency: +${stats.efficiency}%<br>
        Cost: $${stats.cost}<br>
        <small>${stats.description}</small>
    `;
    tooltip.style.position = "absolute";
    tooltip.style.background = "#2a2a2a";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "8px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.fontSize = "0.8em";
    tooltip.style.border = "1px solid #667eea";
    tooltip.style.zIndex = "1000";
    tooltip.style.pointerEvents = "none";
    tooltip.style.whiteSpace = "nowrap";
    
    e.currentTarget.appendChild(tooltip);
}

function hidePartTooltip(e) {
    const tooltip = e.currentTarget.querySelector(".tooltip");
    if (tooltip) tooltip.remove();
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.background = "#667eea";
    notification.style.color = "white";
    notification.style.padding = "15px 20px";
    notification.style.borderRadius = "5px";
    notification.style.fontSize = "1em";
    notification.style.zIndex = "10000";
    notification.style.animation = "slideIn 0.3s ease";
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveEngineToLocalStorage() {
    localStorage.setItem("workifyEngine", JSON.stringify(engine));
}

function loadEngineFromLocalStorage() {
    const saved = localStorage.getItem("workifyEngine");
    if (saved) {
        try {
            engine = JSON.parse(saved);
            updateEngineDisplay();
            updateStats();
        } catch(e) {
            console.error("Error loading engine:", e);
        }
    }
}

function saveStatsToLocalStorage() {
    localStorage.setItem("workifyStats", JSON.stringify(gameStats));
}

function loadStatsFromLocalStorage() {
    const saved = localStorage.getItem("workifyStats");
    if (saved) {
        try {
            gameStats = JSON.parse(saved);
        } catch(e) {
            console.error("Error loading stats:", e);
        }
    }
}

// ============================================
// BUTTON HANDLERS
// ============================================

testButton.addEventListener("click", testEngine);

clearButton.addEventListener("click", () => {
    if (confirm("🗑️ Clear all parts? This cannot be undone!")) {
        engine.parts = [];
        updateEngineDisplay();
        updateStats();
        saveEngineToLocalStorage();
        showNotification("🧹 Engine cleared!");
    }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        testEngine();
    } else if (e.key === "Delete" || e.key === "Backspace") {
        if (engine.parts.length > 0) {
            removePartFromEngine(engine.parts.length - 1);
        }
    }
});

// ============================================
// ANIMATIONS
// ============================================

const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// INITIALIZATION
// ============================================

function initializeGame() {
    loadEngineFromLocalStorage();
    loadStatsFromLocalStorage();
    updateEngineDisplay();
    updateStats();
    showNotification("Welcome to Workify Engines! 🚗");
}

// Start the game
initializeGame();
