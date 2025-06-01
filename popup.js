const redactType = document.getElementById('redactType');
const colorInput = document.getElementById('colorInput');
const customInput = document.getElementById('customInput');

redactType.addEventListener('change', () => {
  colorInput.classList.toggle('hidden', redactType.value !== 'color');
  customInput.classList.toggle('hidden', redactType.value !== 'custom');
});

document.getElementById('redactBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: redactSelectedText,
    args: [
      redactType.value,
      colorInput.value,
      customInput.value
    ]
  });
});

function redactSelectedText(type, color, custom) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);

  let replacement;
  if (type === 'stars') {
    replacement = '*'.repeat(range.toString().length);
    replaceRange(range, replacement, {});
  } else if (type === 'custom') {
    replacement = custom;
    replaceRange(range, replacement, {});
  } else if (type === 'color') {
    replacement = range.toString();
    replaceRange(range, replacement, { bgColor: color });
  }
  selection.removeAllRanges();

  function replaceRange(range, replacement, style = {}) {
    // Remove the selected contents
    range.deleteContents();
    // Create a span element
    const span = document.createElement('span');
    span.textContent = replacement;
    if (style.bgColor) {
      span.style.background = style.bgColor;
      span.style.color = 'transparent';
      span.style.borderRadius = '3px';
      span.style.padding = '2px 4px';
      span.style.userSelect = 'none';
    }
    // Insert the span in place
    range.insertNode(span);
  }
}
