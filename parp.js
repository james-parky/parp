// Remove @media print blocks from stylesheets
function removePrintMediaQueries() {
  // Process inline style tags
  document.querySelectorAll('style').forEach(styleTag => {
    try {
      let css = styleTag.textContent;
      let modified = false;
      
      // Find and remove @media print blocks
      // Match @media print { ... } including nested braces
      let depth = 0;
      let inPrintMedia = false;
      let printMediaStart = -1;
      let result = '';
      let i = 0;
      
      while (i < css.length) {
        // Check if we're starting a @media print block
        if (!inPrintMedia && css.substr(i, 12) === '@media print') {
          inPrintMedia = true;
          printMediaStart = i;
          modified = true;
          // Skip to the opening brace
          while (i < css.length && css[i] !== '{') i++;
          depth = 0;
        }
        
        if (inPrintMedia) {
          if (css[i] === '{') depth++;
          if (css[i] === '}') {
            depth--;
            if (depth === 0) {
              // End of @media print block, skip it
              inPrintMedia = false;
              i++;
              continue;
            }
          }
          i++;
        } else {
          result += css[i];
          i++;
        }
      }
      
      if (modified) {
        styleTag.textContent = result;
      }
    } catch (e) {
      console.error('Error processing style tag:', e);
    }
  });
  
  // Process external stylesheets
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) return;
      
      for (let i = rules.length - 1; i >= 0; i--) {
        const rule = rules[i];
        if (rule.type === CSSRule.MEDIA_RULE && rule.media.mediaText.includes('print')) {
          sheet.deleteRule(i);
        }
      }
    } catch (e) {
      // Ignore cross-origin errors
    }
  });
}

// Run immediately
removePrintMediaQueries();

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', removePrintMediaQueries);
}

// Watch for new styles
const observer = new MutationObserver(() => {
  removePrintMediaQueries();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
