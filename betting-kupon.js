const kupon = document.getElementById('betting-kupon');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Rotation fra -15 til +15 grader alt efter scroll (0-800px)
  let rotation = Math.min(scrollY / 800 * 30, 30) - 15;

  kupon.style.transform = `rotate(${rotation}deg)`;
});
