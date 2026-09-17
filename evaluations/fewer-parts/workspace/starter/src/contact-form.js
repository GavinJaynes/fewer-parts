// Contact form: client-side validation on submit, then POST to the messages endpoint.
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
const message = document.getElementById('message');

// Legacy autosizing. This predates native content sizing and must not grow
// beyond the CSS max-height. The form still needs its separate input handler
// below for validation state.
function resizeMessage() {
  message.style.height = 'auto';
  message.style.height = `${Math.min(message.scrollHeight, 288)}px`;
}

message.addEventListener('input', resizeMessage);
window.addEventListener('resize', resizeMessage);
resizeMessage();

const validators = {
  name: (value) => (value.trim() ? '' : 'Enter your name.'),
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address.',
  message: (value) => {
    const text = value.trim();
    if (!text) return 'Enter a message.';
    if (text.length > 4000) return 'Keep your message under 4000 characters.';
    return '';
  },
};

function setError(field, message) {
  const errorEl = document.getElementById(`${field.name}-error`);
  errorEl.textContent = message;
  errorEl.classList.toggle('hidden', !message);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';
  let firstInvalid = null;

  for (const [name, validate] of Object.entries(validators)) {
    const field = form.elements[name];
    const message = validate(field.value);
    setError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    form.reset();
    status.textContent = 'Thanks, your message has been sent.';
  } catch (error) {
    status.textContent = 'Sorry, something went wrong. Please try again.';
    console.error(error);
  } finally {
    button.disabled = false;
  }
});

// Clear a field's error once the user fixes it.
form.addEventListener('input', (event) => {
  const field = event.target;
  if (field.getAttribute('aria-invalid') === 'true' && validators[field.name]) {
    setError(field, validators[field.name](field.value));
  }
});
