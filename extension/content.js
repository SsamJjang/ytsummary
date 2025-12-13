function createSummaryPanel() {
  // 이미 패널이 있으면 제거
  const existingPanel = document.getElementById('yt-summary-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  const panel = document.createElement('div');
  panel.id = 'yt-summary-panel';
  panel.innerHTML = `
    <div class="yt-summary-header">
      <h3>📝 Summarize Video</h3>
      <button id="yt-summary-close" class="yt-summary-close-btn">✕</button>
    </div>
    <div class="yt-summary-content">
      <button id="yt-summary-btn" class="yt-summary-action-btn">
        🎯 Summarize Caption
      </button>
      <div id="yt-summary-result" class="yt-summary-result"></div>
    </div>
  `;

  // 영상 플레이어 옆에 패널 삽입
  const secondary = document.getElementById('secondary');
  if (secondary) {
    secondary.insertBefore(panel, secondary.firstChild);
  }

  // 이벤트 리스너 등록
  document.getElementById('yt-summary-btn').addEventListener('click', handleSummarize);
  document.getElementById('yt-summary-close').addEventListener('click', () => {
    panel.style.display = 'none';
  });
}

// 요약 버튼 클릭 핸들러
async function handleSummarize() {
  const btn = document.getElementById('yt-summary-btn');
  const resultDiv = document.getElementById('yt-summary-result');
  const videoId = new URLSearchParams(window.location.search).get('v');

  if (!videoId) {
    resultDiv.innerHTML = '<div class="yt-summary-error">❌ Could not find video ID</div>';
    return;
  }

  // 로딩 상태 표시
  btn.disabled = true;
  btn.textContent = '⏳ Analyzing...';
  resultDiv.innerHTML = '<div class="yt-summary-loading">Sending request to server...</div>';

  try {
    // 127.0.0.1:5000/summary로 POST 요청 (query parameter 방식)
    const response = await fetch(`http://127.0.0.1:1234/summary?videoId=${videoId}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      }
    });

    console.log(`[DEBUG] Server: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
    }

    // 응답 받기
    const result = await response.json();
    console.log('[DEBUG] Server:', result);

    // 결과 표시
    btn.disabled = false;
    btn.textContent = '🔄 Try again';

    // 응답 형식에 따라 다르게 표시
    let displayContent = '';
    if (result.summary) {
      displayContent = formatSummary(result.summary);
    } else if (result.result) {
      displayContent = formatSummary(result.result);
    } else if (typeof result === 'string') {
      displayContent = formatSummary(result);
    } else {
      displayContent = formatSummary(JSON.stringify(result, null, 2));
    }

    resultDiv.innerHTML = `
      <div class="yt-summary-success">
        <h4>📌 Analysis</h4>
        <div class="yt-summary-text">${displayContent}</div>
      </div>
    `;

  } catch (error) {
    console.error('[DEBUG] Error:', error);
    
    btn.disabled = false;
    btn.textContent = '🎯 Sumarize caption';

    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = '❌ Could not connect to server.\n\n💡 Ensure that:\n• The server is running\n• http://127.0.0.1/summary All endpoints are active';
    }

    resultDiv.innerHTML = `
      <div class="yt-summary-error">
        ${errorMessage.replace(/\n/g, '<br>')}
      </div>
    `;
  }
}

// 요약 텍스트 포맷팅
function formatSummary(text) {
  if (!text) return '';
  
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- /gm, '• ');
}

// 플레이어 컨트롤바에 요약 버튼 추가
function createPlayerButton() {
  // 이미 버튼이 있으면 제거
  const existingBtn = document.getElementById('yt-summary-player-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  // 유튜브 오른쪽 컨트롤 영역 찾기
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) {
    // 컨트롤이 아직 로드 안됐으면 재시도
    setTimeout(createPlayerButton, 1000);
    return;
  }

  // 버튼 생성
  const button = document.createElement('button');
  button.id = 'yt-summary-player-btn';
  button.className = 'ytp-button yt-summary-player-btn';
  button.title = 'Summarize caption';
  button.innerHTML = '🔁';
  
  // 버튼 클릭 이벤트
  button.addEventListener('click', async (e) => {
    e.stopPropagation();
    // 패널이 없으면 생성
    if (!document.getElementById('yt-summary-panel')) {
      createSummaryPanel();
    }
    // 패널 보이기
    const panel = document.getElementById('yt-summary-panel');
    if (panel) {
      panel.style.display = 'block';
    }
    // 요약 시작
    await handleSummarize();
  });

  // 컨트롤바 맨 앞에 삽입
  rightControls.insertBefore(button, rightControls.firstChild);
}

// 페이지 로드 시 패널 생성
function init() {
  // YouTube 동적 페이지 전환 감지
  let lastUrl = location.href;
  
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.href.includes('youtube.com/watch')) {
        setTimeout(createSummaryPanel, 1000);
        setTimeout(createPlayerButton, 1500);
      }
    }
  });
  
  observer.observe(document.body, { subtree: true, childList: true });
  
  // 초기 페이지 로드 시
  if (location.href.includes('youtube.com/watch')) {
    setTimeout(createSummaryPanel, 1500);
    setTimeout(createPlayerButton, 2000);
  }
}

// 확장 프로그램 시작
init();

// 팝업에서 메시지 수신
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize();
    sendResponse({ status: 'started' });
  } else if (request.action === 'showPanel') {
    const panel = document.getElementById('yt-summary-panel');
    if (panel) {
      panel.style.display = 'block';
    } else {
      createSummaryPanel();
    }
    sendResponse({ status: 'shown' });
  }
});