const trigger = document.getElementById('archive-trigger');
const overlay = document.getElementById('archive-overlay');
const panel = overlay.querySelector('[role="dialog"]');
const cancel = document.getElementById('archive-cancel');
const confirm = document.getElementById('archive-confirm');
const status = document.getElementById('archive-status');
let archived = false;

const focusable = () => [...panel.querySelectorAll('button, [href], input, select, textarea')];

function closeDialog() {
  overlay.hidden = true;
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeydown);
  trigger.focus();
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeDialog();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusable();
  const first = items[0];
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openDialog() {
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleKeydown);
  cancel.focus();
}

function archiveItem() {
  if (archived) return;
  archived = true;
  status.textContent = 'Resource archived.';
}

trigger.addEventListener('click', openDialog);
cancel.addEventListener('click', closeDialog);
confirm.addEventListener('click', () => {
  archiveItem();
  closeDialog();
});
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeDialog();
});
