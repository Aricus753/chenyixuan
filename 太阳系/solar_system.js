document.addEventListener('DOMContentLoaded', () => {
    const speedControl = document.getElementById('speed');
    const speedValue = document.getElementById('speed-value');
    const orbits = document.querySelectorAll('.orbit');
    
    // Store original animation durations
    const originalDurations = {
        'mercury-orbit': 4.15,
        'venus-orbit': 10.8,
        'earth-orbit': 16.4,
        'mars-orbit': 31.2,
        'jupiter-orbit': 82.1,
        'saturn-orbit': 150.2,
        'uranus-orbit': 332.8,
        'neptune-orbit': 512.5
    };

    // Update simulation speed when slider changes
    speedControl.addEventListener('input', () => {
        const speed = parseFloat(speedControl.value);
        speedValue.textContent = speed.toFixed(1) + 'x';
        
        // Apply speed to all orbits
        orbits.forEach(orbit => {
            const orbitClass = orbit.classList[1]; // Get the second class (e.g., 'mercury-orbit')
            
            if (orbitClass && originalDurations[orbitClass]) {
                // Calculate new duration based on speed
                const newDuration = originalDurations[orbitClass] / speed;
                
                // Apply new animation with updated duration
                orbit.style.animation = `orbit ${newDuration}s linear infinite`;
            }
        });
    });
    
    // Function to get the original duration based on animation name
    function getOriginalDuration(animationName) {
        // Map animation names to their original durations
        const durationMap = {
            'orbit': 10, // Default if animation name doesn't match
            'mercury-orbit_animation': 4.15,
            'venus-orbit_animation': 10.8,
            'earth-orbit_animation': 16.4,
            'mars-orbit_animation': 31.2,
            'jupiter-orbit_animation': 82.1,
            'saturn-orbit_animation': 150.2,
            'uranus-orbit_animation': 332.8,
            'neptune-orbit_animation': 512.5
        };
        
        // For this implementation, we'll use the CSS animation durations directly
        // The durations in the CSS are already set correctly for relative orbital periods
        // So we just need to adjust them by the speed factor
        
        // Default to 10s if animation name not found
        return durationMap[animationName] || 10;
    }
    
    // Initialize with the correct durations for each planet
    const planetDurations = {
        'mercury-orbit': 4.15,
        'venus-orbit': 10.8,
        'earth-orbit': 16.4,
        'mars-orbit': 31.2,
        'jupiter-orbit': 82.1,
        'saturn-orbit': 150.2,
        'uranus-orbit': 332.8,
        'neptune-orbit': 512.5
    };
    
    // Initialize the speed value display
    speedValue.textContent = speedControl.value + 'x';
    
    // Add zoom functionality with mouse wheel
    let scale = 1;
    const solarSystem = document.querySelector('.solar-system');
    
    document.body.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // Adjust zoom speed
        const zoomIntensity = 0.1;
        
        if (e.deltaY < 0) {
            // Zoom in
            scale += zoomIntensity;
        } else {
            // Zoom out
            scale -= zoomIntensity;
        }
        
        // Limit zoom range
        scale = Math.min(Math.max(0.5, scale), 3);
        
        // Apply the scale transform
        solarSystem.style.transform = `scale(${scale})`;
    });
    
    // Add drag to rotate functionality
    let isDragging = false;
    let previousX = 0;
    let rotation = 0;
    
    document.body.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousX = e.clientX;
    });
    
    document.body.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousX;
        rotation += deltaX * 0.5; // Adjust sensitivity
        
        // Apply rotation to all orbits to simulate 3D rotation
        orbits.forEach(orbit => {
            orbit.style.transform = `rotate(${rotation}deg)`;
        });
        
        previousX = e.clientX;
    });
    
    document.body.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    document.body.addEventListener('mouseleave', () => {
        isDragging = false;
    });
});