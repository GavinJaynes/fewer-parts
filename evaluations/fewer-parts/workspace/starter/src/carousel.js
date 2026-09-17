const carousel = document.getElementById('collection-carousel');
const slides = [...carousel.querySelectorAll('[data-slide]')];
const previous = document.getElementById('previous-slide');
const next = document.getElementById('next-slide');
const status = document.getElementById('carousel-status');
let activeIndex = 0;

function showSlide(index) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  slides[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  status.textContent = `Collection ${activeIndex + 1} of ${slides.length}`;
  previous.disabled = activeIndex === 0;
  next.disabled = activeIndex === slides.length - 1;
}

previous.addEventListener('click', () => showSlide(activeIndex - 1));
next.addEventListener('click', () => showSlide(activeIndex + 1));
carousel.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
  if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
});
carousel.addEventListener('scrollend', () => {
  const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
  if (index !== activeIndex) showSlide(index);
});

showSlide(0);
