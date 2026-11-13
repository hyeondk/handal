'use strict';

// 소개 페이지의 화면 안내만 전환합니다. 계정·기록·저장소에 접근하지 않습니다.
for (const group of document.querySelectorAll('[data-tab-group]')) {
  const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
  function selectTab(selectedTab, focus = false) {
    for (const tab of tabs) {
      const selected = tab === selectedTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    }
    if (focus) selectedTab.focus({ preventScroll: true });
  }
  for (const tab of tabs) {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[next], true);
    });
  }
}

const examples = {
  mobile: { label: '모바일', width: 390, height: 844, src: './assets/screenshots/handal-mobile.png' },
  tablet: { label: '태블릿', width: 820, height: 1180, src: './assets/screenshots/handal-tablet.png' },
  desktop: { label: 'PC', width: 1440, height: 1000, src: './assets/screenshots/handal-desktop.png' },
};
const deviceButtons = Array.from(document.querySelectorAll('[data-device]'));
const previewImage = document.getElementById('preview-image');
const dialogImage = document.getElementById('dialog-image');
const dialogDevice = document.getElementById('screen-dialog-device');
const screenDialog = document.getElementById('screen-dialog');
let activeDevice = 'desktop';
let returnFocus;
let closing = false;

function setExample(device) {
  const example = examples[device];
  if (!example) return;
  activeDevice = device;
  for (const button of deviceButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.device === device));
  }
  previewImage.src = example.src;
  previewImage.alt = `${example.label} 사용 내역 화면의 가상 예시`;
  previewImage.width = example.width;
  previewImage.height = example.height;
  dialogDevice.textContent = `${example.label} / 가상 예시`;
}

for (const button of deviceButtons) {
  button.addEventListener('click', () => setExample(button.dataset.device));
}

setExample(window.matchMedia('(max-width: 600px)').matches ? 'mobile' : window.matchMedia('(max-width: 1050px)').matches ? 'tablet' : 'desktop');

function openScreen(event) {
  if (screenDialog.open || closing) return;
  const example = examples[activeDevice];
  dialogImage.src = example.src;
  dialogImage.alt = previewImage.alt;
  dialogImage.width = example.width;
  dialogImage.height = example.height;
  returnFocus = event.currentTarget;
  document.body.classList.add('dialog-open');
  screenDialog.showModal();
  screenDialog.querySelector('.dialog-content').scrollTop = 0;
}

function closeScreen() {
  if (!screenDialog.open || closing) return;
  closing = true;
  screenDialog.classList.add('is-closing');
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200;
  window.setTimeout(() => {
    screenDialog.close();
    screenDialog.classList.remove('is-closing');
    document.body.classList.remove('dialog-open');
    closing = false;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }, duration);
}

for (const button of document.querySelectorAll('[data-open-screen]')) button.addEventListener('click', openScreen);
document.querySelector('[data-close-screen]').addEventListener('click', closeScreen);
screenDialog.addEventListener('cancel', event => { event.preventDefault(); closeScreen(); });
screenDialog.addEventListener('click', event => {
  if (event.target !== screenDialog) return;
  const bounds = screenDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeScreen();
});
screenDialog.addEventListener('touchmove', event => {
  if (!event.target.closest('.dialog-content')) event.preventDefault();
}, { passive: false });
