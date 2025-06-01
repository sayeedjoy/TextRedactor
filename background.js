chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "redact-color",
    title: "Redact with Solid Color",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "redact-stars",
    title: "Redact with Stars (******)",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "redact-custom",
    title: "Redact with Custom Text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return;

  if (info.menuItemId === "redact-custom") {
    // For custom, prompt user for input through a window prompt
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: promptForCustomRedact,
      args: []
    });
  } else {
    // For color or stars, run redaction directly with fixed args
    const type = info.menuItemId === "redact-color" ? "color" : "stars";
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: redactSelectedText,
      args: [type, "#000000", ""]
    });
  }
});

// Function to redact selected text for color or stars (same as popup.js)
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
    range.deleteContents();
    const span = document.createElement('span');
    span.textContent = replacement;
    if (style.bgColor) {
      span.style.background = style.bgColor;
      span.style.color = 'transparent';
      span.style.borderRadius = '3px';
      span.style.padding = '2px 4px';
      span.style.userSelect = 'none';
    }
    range.insertNode(span);
  }
}

// Function to prompt user for custom input and redact
function promptForCustomRedact() {
  const custom = prompt("Enter replacement text:");
  if (custom === null || custom === "") return; // Cancelled or empty
  redactSelectedText('custom', null, custom);
}
