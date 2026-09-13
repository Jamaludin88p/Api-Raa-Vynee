const themeToggle = document.getElementById('themeToggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const tocPanel = document.getElementById('tocPanel');

themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

sidebarToggle?.addEventListener('click', () => {
  tocPanel.hidden = !tocPanel.hidden;
});
