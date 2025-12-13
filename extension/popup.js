// popup.js - 팝업 스크립트

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const showPanelBtn = document.getElementById('showPanelBtn');
  const webhookInput = document.getElementById('webhookUrl');
  const saveStatus = document.getElementById('saveStatus');

  // 저장된 Webhook URL 불러오기
  const stored = await chrome.storage.local.get(['webhookUrl']);
  if (stored.webhookUrl) {
    webhookInput.value = stored.webhookUrl;
  }

  // Webhook URL 변경 시 자동 저장
  let saveTimeout;
  webhookInput.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await chrome.storage.local.set({ webhookUrl: webhookInput.value });
      saveStatus.classList.add('show');
      setTimeout(() => saveStatus.classList.remove('show'), 2000);
    }, 500);
  });

  // 현재 탭 확인
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isYouTube = tab.url && tab.url.includes('youtube.com/watch');

  if (isYouTube) {
    statusDiv.className = 'status youtube';
    statusDiv.innerHTML = `
      <div class="status-icon">▶️</div>
      <div class="status-text">YouTube 영상 감지됨<br><small style="color:#666">${tab.title}</small></div>
    `;
    summarizeBtn.disabled = false;
    showPanelBtn.disabled = false;
  } else {
    statusDiv.className = 'status not-youtube';
    statusDiv.innerHTML = `
      <div class="status-icon">⚠️</div>
      <div class="status-text">Not a valid Youtube page.<br><small style="color:#666">Open a video first.</small></div>
    `;
  }

  // 요약 버튼 클릭
  summarizeBtn.addEventListener('click', async () => {
    if (!webhookInput.value) {
      alert('Set the Make.com Webhook URL first.');
      webhookInput.focus();
      return;
    }

    // content script에 webhook URL 전달 및 요약 시작
    await chrome.tabs.sendMessage(tab.id, {
      action: 'summarize',
      webhookUrl: webhookInput.value
    });

    window.close();
  });

  // 패널 보기 버튼 클릭
  showPanelBtn.addEventListener('click', async () => {
    await chrome.tabs.sendMessage(tab.id, { action: 'showPanel' });
    window.close();
  });
});
