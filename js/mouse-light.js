const mouseLight = document.getElementById('mouse-light');

document.addEventListener('mousemove', (e) => {
    mouseLight.style.left = `${e.clientX}px`;
    mouseLight.style.top = `${e.clientY}px`;
})