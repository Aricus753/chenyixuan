// Chimney Demolition Simulation
const canvas = document.getElementById('chimney-canvas');
const ctx = canvas.getContext('2d');

// Simulation state
let chimney = null;
let particles = [];
let debris = [];
let isDemolished = false;
let simulationRunning = false;

// Configuration
const config = {
    gravity: 0.5,
    explosionPower: 5,
    demolitionMode: 'explosion',
    chimneyHeight: 400,
    chimneyWidth: 60,
    chimneyX: canvas.width / 2,
    chimneyY: canvas.height - 50
};

// Initialize chimney
function initChimney() {
    chimney = {
        x: config.chimneyX,
        y: config.chimneyY - config.chimneyHeight,
        width: config.chimneyWidth,
        height: config.chimneyHeight,
        segments: 8, // Number of segments for the chimney
        segmentHeight: config.chimneyHeight / 8,
        strength: 1.0, // Structural integrity (1.0 = intact, 0 = completely destroyed)
        falling: false,
        rotation: 0,
        rotationSpeed: 0,
        baseX: config.chimneyX, // Original base position
        baseY: config.chimneyY
    };

    // Create chimney segments
    chimney.segments = [];
    for (let i = 0; i < 8; i++) {
        chimney.segments.push({
            x: config.chimneyX - config.chimneyWidth / 2,
            y: config.chimneyY - config.chimneyHeight + i * chimney.segmentHeight,
            width: config.chimneyWidth,
            height: chimney.segmentHeight,
            strength: 1.0,
            broken: false
        });
    }

    isDemolished = false;
    simulationRunning = false;
    particles = [];
    debris = [];
}

// Draw chimney
function drawChimney() {
    if (!chimney) return;

    // Draw chimney segments
    for (let i = 0; i < chimney.segments.length; i++) {
        const segment = chimney.segments[i];
        
        if (!segment.broken) {
            // Draw segment with brick pattern
            ctx.fillStyle = '#8B4513'; // Brick color
            ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
            
            // Draw brick pattern
            ctx.strokeStyle = '#6B3A0E';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x, segment.y, segment.width, segment.height);
            
            // Draw horizontal lines between bricks
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(segment.x, segment.y);
                ctx.lineTo(segment.x + segment.width, segment.y);
                ctx.strokeStyle = '#65360B';
                ctx.stroke();
            }
        }
    }
}

// Draw particles
function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Draw debris
function drawDebris() {
    for (let i = 0; i < debris.length; i++) {
        const d = debris[i];
        
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x, d.y, d.width, d.height);
        ctx.globalAlpha = 1.0;
    }
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += config.gravity * 0.3; // Reduced gravity effect for particles
        
        p.life -= 1;
        p.alpha = p.life / p.maxLife;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Update debris
function updateDebris() {
    for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        
        d.x += d.vx;
        d.y += d.vy;
        d.vy += config.gravity;
        d.rotation += d.rotationSpeed;
        
        d.life -= 1;
        d.alpha = d.life / d.maxLife;
        
        if (d.y > canvas.height) {
            d.vy = -Math.abs(d.vy) * 0.5; // Bounce
            d.y = canvas.height;
        }
        
        if (d.life <= 0) {
            debris.splice(i, 1);
        }
    }
}

// Create explosion effect
function createExplosion(x, y, power) {
    const particleCount = Math.floor(power * 10);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * power * 2;
        
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 4 + 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: `rgba(255, ${Math.floor(Math.random() * 100)}, 0, 1)`, // Fire colors
            life: Math.random() * 30 + 20,
            maxLife: 50,
            alpha: 1.0
        });
    }
}

// Create debris from chimney segments
function createDebrisFromSegment(segment) {
    const debrisCount = 4;
    const particleCount = 8;
    
    // Create debris pieces
    for (let i = 0; i < debrisCount; i++) {
        const width = Math.random() * 15 + 5;
        const height = Math.random() * 15 + 5;
        
        debris.push({
            x: segment.x + Math.random() * segment.width,
            y: segment.y + Math.random() * segment.height,
            width: width,
            height: height,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 1) * 6,
            rotation: Math.random() * 0.2 - 0.1,
            rotationSpeed: Math.random() * 0.1 - 0.05,
            color: i % 2 === 0 ? '#8B4513' : '#6B3A0E', // Brick colors
            life: Math.random() * 100 + 100,
            maxLife: 200,
            alpha: 1.0
        });
    }
    
    // Create dust particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: segment.x + Math.random() * segment.width,
            y: segment.y + Math.random() * segment.height,
            size: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 1) * 2,
            color: `rgba(139, 139, 139, ${Math.random() * 0.4 + 0.2})`, // Dust color
            life: Math.random() * 40 + 30,
            maxLife: 70,
            alpha: 1.0
        });
    }
}

// Create dust cloud effect
function createDustCloud(x, y, radius, density) {
    const particleCount = Math.floor(radius * density);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        particles.push({
            x: px,
            y: py,
            size: Math.random() * 4 + 1,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 1) * 1.5,
            color: `rgba(139, 139, 139, ${Math.random() * 0.3 + 0.1})`, // Dust color
            life: Math.random() * 60 + 40,
            maxLife: 100,
            alpha: 1.0
        });
    }
}

// Start demolition
function startDemolition() {
    if (isDemolished || simulationRunning) return;
    
    simulationRunning = true;
    isDemolished = true;
    
    // Apply demolition based on mode
    if (config.demolitionMode === 'explosion') {
        // Create explosion at the base of the chimney
        createExplosion(config.chimneyX, config.chimneyY, config.explosionPower);
        
        // Create initial dust cloud
        createDustCloud(config.chimneyX, config.chimneyY, 100, 0.8);
        
        // Break all segments
        for (let i = 0; i < chimney.segments.length; i++) {
            chimney.segments[i].broken = true;
            // Add some random velocity to segments based on explosion power
            chimney.segments[i].vx = (Math.random() - 0.5) * config.explosionPower;
            chimney.segments[i].vy = -Math.random() * config.explosionPower * 0.5;
            createDebrisFromSegment(chimney.segments[i]);
        }
    } else if (config.demolitionMode === 'topple') {
        // Create some initial dust
        createDustCloud(config.chimneyX, config.chimneyY, 50, 0.5);
        
        // Make the chimney start to topple
        chimney.falling = true;
        chimney.rotationSpeed = 0.02 * (Math.random() > 0.5 ? 1 : -1);
    } else if (config.demolitionMode === 'collapse') {
        // Create dust cloud at the base
        createDustCloud(config.chimneyX, config.chimneyY, 70, 0.6);
        
        // Simply let gravity do the work
        for (let i = 0; i < chimney.segments.length; i++) {
            if (i > 4) { // Break the lower half
                chimney.segments[i].broken = true;
                createDebrisFromSegment(chimney.segments[i]);
            }
        }
    }
}

// Update chimney physics
function updateChimney() {
    if (!chimney || !isDemolished) return;
    
    // Handle different demolition modes
    if (config.demolitionMode === 'topple') {
        if (chimney.falling) {
            // Update rotation
            chimney.rotation += chimney.rotationSpeed;
            chimney.rotationSpeed += 0.001; // Increase rotation speed over time
            
            // Calculate new position based on rotation
            for (let i = 0; i < chimney.segments.length; i++) {
                const segment = chimney.segments[i];
                const dy = segment.y - chimney.baseY;
                const distance = Math.sqrt((segment.x - chimney.baseX) ** 2 + dy ** 2);
                
                // Rotate around the base
                const angle = Math.atan2(dy, segment.x - chimney.baseX) + chimney.rotation;
                segment.x = chimney.baseX + Math.cos(angle) * distance;
                segment.y = chimney.baseY + Math.sin(angle) * distance;
            }
            
            // Stop simulation when chimney hits the ground
            if (chimney.rotation > Math.PI / 2) {
                simulationRunning = false;
            }
        }
    } else if (config.demolitionMode === 'collapse') {
        // Handle segment-by-segment collapse
        for (let i = 0; i < chimney.segments.length; i++) {
            const segment = chimney.segments[i];
            
            if (segment.broken) {
                // Apply physics to broken segments
                segment.vy = segment.vy || 0;
                segment.vy += config.gravity;
                segment.y += segment.vy;
                
                // Check if segment hits the ground
                if (segment.y + segment.height > config.chimneyY) {
                    segment.y = config.chimneyY - segment.height;
                    segment.vy *= -0.3; // Bounce with energy loss
                    
                    // Check if velocity is very small to stop bouncing
                    if (Math.abs(segment.vy) < 0.5) {
                        segment.vy = 0;
                    }
                }
            } else {
                // Check if segment above a broken segment should break too
                if (i > 0 && chimney.segments[i-1].broken) {
                    // Probability of breaking increases with explosion power
                    if (Math.random() < 0.05 * config.explosionPower) {
                        segment.broken = true;
                        createDebrisFromSegment(segment);
                    }
                }
            }
        }
    } else if (config.demolitionMode === 'explosion') {
        // For explosion mode, all segments are already broken
        // Just apply physics to all debris and particles
        for (let i = 0; i < chimney.segments.length; i++) {
            const segment = chimney.segments[i];
            
            if (segment.broken) {
                // Apply physics to broken segments
                segment.vy = segment.vy || 0;
                segment.vx = segment.vx || 0;
                
                segment.vy += config.gravity;
                segment.x += segment.vx;
                segment.y += segment.vy;
                
                // Apply air resistance
                segment.vx *= 0.99;
                segment.vy *= 0.99;
                
                // Check if segment hits the ground
                if (segment.y + segment.height > config.chimneyY) {
                    segment.y = config.chimneyY - segment.height;
                    segment.vy *= -0.3; // Bounce with energy loss
                    segment.vx *= 0.8; // Friction
                    
                    // Check if velocity is very small to stop bouncing
                    if (Math.abs(segment.vy) < 0.5) {
                        segment.vy = 0;
                    }
                }
            }
        }
    }
}

// Main animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateChimney();
    updateParticles();
    updateDebris();
    
    // Create additional dust effects during demolition
    if (isDemolished && Math.random() < 0.3) {
        for (let i = 0; i < debris.length; i++) {
            if (Math.abs(debris[i].vy) > 3 && Math.random() < 0.2) { // Only when moving fast
                createDustCloud(debris[i].x, debris[i].y, 10, 0.3);
            }
        }
    }
    
    drawChimney();
    drawParticles();
    drawDebris();
    
    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('explosion-power').addEventListener('input', function() {
    config.explosionPower = parseFloat(this.value);
    document.getElementById('power-value').textContent = config.explosionPower.toFixed(1);
});

document.getElementById('demolition-mode').addEventListener('change', function() {
    config.demolitionMode = this.value;
});

document.getElementById('reset-btn').addEventListener('click', function() {
    initChimney();
});

// Initialize and start the simulation
initChimney();
animate();

// Start demolition on click anywhere in the canvas (for demo purposes)
canvas.addEventListener('click', startDemolition);

// Add keyboard controls
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        // Space bar to start demolition
        startDemolition();
    } else if (e.code === 'KeyR') {
        // R key to reset
        initChimney();
    } else if (e.code === 'ArrowUp') {
        // Increase explosion power
        config.explosionPower = Math.min(10, config.explosionPower + 0.5);
        document.getElementById('explosion-power').value = config.explosionPower;
        document.getElementById('power-value').textContent = config.explosionPower.toFixed(1);
    } else if (e.code === 'ArrowDown') {
        // Decrease explosion power
        config.explosionPower = Math.max(1, config.explosionPower - 0.5);
        document.getElementById('explosion-power').value = config.explosionPower;
        document.getElementById('power-value').textContent = config.explosionPower.toFixed(1);
    }
});