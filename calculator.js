

// DOM refs
const display = document.getElementById('display');
const keys = document.querySelectorAll('.key-grid .btn');

// State
let expression = '';       
let lastWasEval = false;   

// Append value to expression and update display
function appendValue(val) {
  if (lastWasEval && /[0-9.]/.test(val)) {
    expression = val;
    lastWasEval = false;
  } else {
    expression += val;
  }
  renderDisplay();
}

// Render display text (with simple trimming)
function renderDisplay() {
  let text = expression || '0';
  if (text.length > 24) {
    display.textContent = text.slice(-24);
  } else {
    display.textContent = text;
  }
}

// Clear everything
function clearAll() {
  expression = '';
  lastWasEval = false;
  renderDisplay();
  animateResult(); 
}

// Delete last character
function deleteLast() {
  if (expression.length > 0) {
    expression = expression.slice(0, -1);
  }
  renderDisplay();
}

// Evaluate expression safely
function evaluateExpression() {
  if (!expression) return;

  const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

  
  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
    showError('Invalid characters');
    return;
  }

  try {
    
    const result = Function('"use strict";return (' + sanitized + ')')();

    if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
      showError('Math error');
      return;
    }

    const formatted = Number.isInteger(result) ? result.toString()
      : parseFloat(result.toFixed(8)).toString();

    expression = formatted;
    lastWasEval = true;
    renderDisplay();
    animateResult(true);

  } catch (err) {
    showError('Syntax error');
  }
}

// Show an error briefly in the display
function showError(msg) {
  const prev = display.textContent;
  display.textContent = msg;
  display.style.color = '#b85b00';
  setTimeout(() => {
    display.style.color = '#0d0d0d';
    renderDisplay();
  }, 1100);
}

function animateResult(success = false) {
  display.animate(
    [
      { transform: 'scale(1)', boxShadow: 'none' },
      { transform: success ? 'scale(1.03)' : 'scale(0.98)', boxShadow: success ? '0 8px 30px rgba(81,192,255,0.18)' : 'none' },
      { transform: 'scale(1)', boxShadow: 'none' }
    ],
    { duration: 420, easing: 'ease-in-out' }
  );
}

// Button clicks
keys.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const v = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');

    if (action === 'clear') { clearAll(); return; }
    if (action === 'delete') { deleteLast(); return; }
    if (action === 'equals') { evaluateExpression(); return; }

    if (v) appendValue(v);
  });
});


window.addEventListener('keydown', (e) => {
  const key = e.key;

  if ((/^[0-9.]$/).test(key)) {
    appendValue(key);
    return;
  }

  // Operators mapping (allow * / + - parentheses)
  if (key === '*' || key === '/' || key === '+' || key === '-' || key === '(' || key === ')') {
    appendValue(key);
    return;
  }

  // Enter or '=' => evaluate
  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    evaluateExpression();
    return;
  }

  // Backspace => delete
  if (key === 'Backspace') {
    deleteLast();
    return;
  }

  // Escape => clear
  if (key === 'Escape') {
    clearAll();
    return;
  }
});

// Initialize display
renderDisplay();
