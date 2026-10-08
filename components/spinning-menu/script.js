const centerBtn = document.querySelector('.center-btn');
const menuWheel = document.querySelector('.menu-wheel');
const menuItems = document.querySelectorAll('.menu-item button');

let isOpen = false;
let currentRotation = 0;
const step = 72; // 360 / 5 items

centerBtn.addEventListener('click', () => {
  isOpen = !isOpen;
  centerBtn.classList.toggle('active');
  
  if (isOpen) {
    // Rotate to position first item at top
    currentRotation = 0;
    menuWheel.style.transform = `rotate(${currentRotation}deg)`;
  }
});

// Add click event to each menu item
menuItems.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (!isOpen) return;
    
    // Rotate so clicked item comes to top position
    currentRotation = index * step;
    menuWheel.style.transform = `rotate(${currentRotation}deg)`;
    
    // You can add your own navigation logic here
    console.log(`Selected: ${btn.textContent.trim()}`);
  });
});
