// 负责全站 Bootstrap Tooltip 懶載
export function initTooltips() {
  let current = null;
  document.body.addEventListener('mouseover', e => {
    const a = e.target.closest('[data-bs-toggle="tooltip"]');
    if (!a) return;
    if (!a._tooltip) a._tooltip = new bootstrap.Tooltip(a, { container: 'body' });
    if (current && current !== a._tooltip) current.hide();
    a._tooltip.show();
    current = a._tooltip;
  });
  document.body.addEventListener('mouseout', e => {
    const a = e.target.closest('[data-bs-toggle="tooltip"]');
    if (a && a._tooltip) a._tooltip.hide();
  });
}
