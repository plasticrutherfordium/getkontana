// SPDX-License-Identifier: MPL-2.0
// Focus stays inside the foremost dialog and returns to its trigger on close.
(() => {
  let activeDialog = null;
  let returnFocus = null;
  const focusable = (dialog) => [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter((node) => node.getClientRects().length);
  const sync = () => {
    const dialogs = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')];
    const next = dialogs.at(-1) || null;
    if (next === activeDialog) return;
    if (next) {
      if (!activeDialog) returnFocus = document.activeElement;
      activeDialog = next;
      document.body.classList.add('dialog-open');
      if (!next.contains(document.activeElement)) (focusable(next)[0] || next).focus();
    } else {
      activeDialog = null;
      document.body.classList.remove('dialog-open');
      if (returnFocus?.isConnected) returnFocus.focus();
      returnFocus = null;
    }
  };
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', (event) => {
    if (!activeDialog || event.key !== 'Tab') return;
    const items = focusable(activeDialog);
    if (!items.length) { event.preventDefault(); return; }
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  });
  sync();
})();
