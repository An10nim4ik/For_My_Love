let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let slideWidth = 0;
let images = [];
const slider = document.getElementById('slider');

async function fetchMedia() {
    try {
        const response = await fetch('http://localhost:5000/get_media');
        const data = await response.json();

        // Shuffle the images randomly
        images = shuffleArray(data);

        // Create image elements and append them to the slider
        images.forEach(item => {
            const img = document.createElement('img');
            img.src = `data:image/jpeg;base64,${item.media}`;
            img.alt = item.filename;
            slider.appendChild(img);
        });

        slideWidth = window.innerWidth;  // Set slideWidth to the width of the viewport
        addDraggingFunctionality();
    } catch (error) {
        console.error('Error fetching media:', error);
    }
}

// Shuffle the array randomly
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    return arr;
}

function addDraggingFunctionality() {
    const sliderContainer = document.getElementById('slider-container');

    sliderContainer.addEventListener('mousedown', startDrag);
    sliderContainer.addEventListener('mouseup', stopDrag);
    sliderContainer.addEventListener('mouseleave', stopDrag);
    sliderContainer.addEventListener('mousemove', handleDragging);

    sliderContainer.addEventListener('touchstart', startDrag);
    sliderContainer.addEventListener('touchend', stopDrag);
    sliderContainer.addEventListener('touchmove', handleDragging);
}

function startDrag(event) {
    if (event.type === 'mousedown' && event.button !== 0) return;
    event.preventDefault();
    isDragging = true;
    startX = getPositionX(event);
    slider.style.transition = 'none';  // Disable transition while dragging
    slider.style.cursor = 'grabbing';  // Change cursor to grabbing
}

function handleDragging(event) {
    if (!isDragging) return;
    event.preventDefault();
    const currentX = getPositionX(event);
    const movementX = currentX - startX;
    currentTranslate = prevTranslate + movementX;

    // Keep the slider centered and within boundaries
    setSliderPosition(currentTranslate);
}

function stopDrag() {
    if (!isDragging) return;
    isDragging = false;

    const movedBy = currentTranslate - prevTranslate;

    if (Math.abs(movedBy) >= slideWidth / 2) {  // Drag threshold is half the image width
        if (movedBy < 0) {
            prevTranslate -= slideWidth;  // Move to the next image
        } else {
            prevTranslate += slideWidth;  // Move to the previous image
        }
    }

    // Make sure the slider stays within the bounds
    prevTranslate = Math.max(Math.min(prevTranslate, 0), -slideWidth * (slider.children.length - 1));
    
    // Smooth transition after drag
    slider.style.transition = 'transform 0.3s ease'; 
    setSliderPosition(prevTranslate);

    slider.style.cursor = 'grab';  // Reset cursor back to grab
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function setSliderPosition(translateValue) {
    // Ensure slider stays within its boundaries and stays centered
    slider.style.transform = `translateX(${translateValue}px)`;
}

window.onload = fetchMedia;
