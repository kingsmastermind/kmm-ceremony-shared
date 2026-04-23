/* KMM Ceremony Shared JS v1.0.0
 * Served via cdn.jsdelivr.net/gh/kingsmastermind/kmm-ceremony-shared@1.0.0/ceremony-shared.js
 * Contains: render functions, indicators, selection system, ARCANA waveform, CSS injection
 * Called by Ceremony Renderer (ceremony.th1nkt4nk.xyz) via compact output mode
 */

// === CSS INJECTION ===
(function() {
  var style = document.createElement('style');
  style.textContent = `
@keyframes redPulse {
  0% { box-shadow: 0 0 0 0 rgba(226,75,74,0.45); }
  50% { box-shadow: 0 0 8px 3px rgba(226,75,74,0.2); }
  100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.45); }
}
@keyframes goldFlash {
  0% { box-shadow: 0 0 0 0 rgba(186,117,23,0.5); transform: scale(1); }
  30% { box-shadow: 0 0 10px 4px rgba(186,117,23,0.3); transform: scale(1.2) rotate(15deg); }
  60% { box-shadow: 0 0 4px 1px rgba(186,117,23,0.1); transform: scale(1.05) rotate(5deg); }
  100% { box-shadow: none; transform: scale(1) rotate(0deg); }
}
@keyframes purpleExec {
  0% { box-shadow: 0 0 0 0 rgba(127,119,221,0.4), 0 0 0 0 rgba(255,255,255,0.1); }
  50% { box-shadow: 0 0 22px 8px rgba(127,119,221,0.15), 0 0 35px 14px rgba(255,255,255,0.04); }
  100% { box-shadow: 0 0 0 0 rgba(127,119,221,0.4), 0 0 0 0 rgba(255,255,255,0.1); }
}
@keyframes spinUnlock {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(360deg) scale(1.15); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes arcanaSpin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(360deg) scale(1.2); }
  100% { transform: rotate(720deg) scale(1); }
}
@keyframes arcanaWaveform {
  0% { height: 4px; }
  100% { height: 24px; }
}
`;
  document.head.appendChild(style);
})();

// === INDICATORS ===

var crosshairOff = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="var(--color-border-secondary)" stroke-width="1"/><line x1="8" y1="1" x2="8" y2="4" stroke="var(--color-border-secondary)" stroke-width="1"/><line x1="8" y1="12" x2="8" y2="15" stroke="var(--color-border-secondary)" stroke-width="1"/><line x1="1" y1="8" x2="4" y2="8" stroke="var(--color-border-secondary)" stroke-width="1"/><line x1="12" y1="8" x2="15" y2="8" stroke="var(--color-border-secondary)" stroke-width="1"/></svg>';
var crosshairOn = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="#E24B4A" stroke-width="1.2"/><circle cx="8" cy="8" r="2" fill="#E24B4A"/><line x1="8" y1="1" x2="8" y2="4" stroke="#E24B4A" stroke-width="1.2"/><line x1="8" y1="12" x2="8" y2="15" stroke="#E24B4A" stroke-width="1.2"/><line x1="1" y1="8" x2="4" y2="8" stroke="#E24B4A" stroke-width="1.2"/><line x1="12" y1="8" x2="15" y2="8" stroke="#E24B4A" stroke-width="1.2"/></svg>';
var starOff = '<svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 9.8,6 15,6.2 10.9,9.5 12.4,14.6 8,11.6 3.6,14.6 5.1,9.5 1,6.2 6.2,6" fill="none" stroke="var(--color-border-secondary)" stroke-width="1"/></svg>';
var starOn = '<svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 9.8,6 15,6.2 10.9,9.5 12.4,14.6 8,11.6 3.6,14.6 5.1,9.5 1,6.2 6.2,6" fill="#BA7517" stroke="#BA7517" stroke-width="0.5"/></svg>';


// === SELECTION STATE ===

var selectedTask = -1;
var selectedCol = null;
var selectedRadar = new Set();
var checkedAQ = new Set();
var allTaskCards = [];

function buildTaskCard(item, container, col, idx) {
  var card = document.createElement('div');
  var baseStyle = 'background:var(--color-background-primary);border:.5px solid var(--color-border-tertiary);border-left:3px solid ' + item.color + ';border-radius:0;padding:10px 12px;cursor:pointer;transition:all .2s;display:flex;align-items:flex-start;gap:10px';
  if (item.glow) baseStyle += ';box-shadow:0 0 8px rgba(255,255,255,0.15)';
  card.style.cssText = baseStyle;
  card.dataset.col = col;
  card.dataset.idx = idx;
  var ind = document.createElement('div');
  ind.style.cssText = 'width:18px;height:18px;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all .2s;border-radius:50%';
  ind.innerHTML = crosshairOff;
  var titleWeight = item.glow ? '600' : '500';
  var content = document.createElement('div');
  content.style.cssText = 'flex:1';
  content.innerHTML = '<div style="font-size:13px;font-weight:' + titleWeight + '">' + item.title + '</div><div style="font-size:11px;color:var(--color-text-secondary)">' + item.desc + '</div>';
  card.appendChild(ind);
  card.appendChild(content);
  allTaskCards.push({card:card, ind:ind, col:col, idx:idx, item:item});
  card.addEventListener('click', function() {
    var thisCol = card.dataset.col;
    var thisIdx = parseInt(card.dataset.idx);
    if (selectedTask === thisIdx && selectedCol === thisCol) {
      deselectAll(); selectedTask = -1; selectedCol = null;
    } else {
      deselectAll();
      ind.innerHTML = crosshairOn;
      ind.style.animation = 'redPulse 1.5s ease-in-out infinite';
      card.style.borderLeftColor = '#E24B4A';
      card.style.boxShadow = '0 0 8px rgba(226,75,74,0.12)';
      selectedTask = thisIdx; selectedCol = thisCol;
    }
  });
  container.appendChild(card);
}

function deselectAll() {
  allTaskCards.forEach(function(tc) {
    tc.ind.innerHTML = crosshairOff;
    tc.ind.style.animation = 'none';
    tc.card.style.borderLeftColor = tc.item.color;
    tc.card.style.boxShadow = tc.item.glow ? '0 0 8px rgba(255,255,255,0.15)' : 'none';
  });
}


// === MERGE PAYLOAD ===

function getUserNotes() { return (document.getElementById('userNotes').value || '').trim(); }

function buildMergePayload() {
  var parts = [];
  if (selectedCol !== null && selectedTask >= 0) {
    var taskList = selectedCol === 'threads' ? threads : targets;
    var taskPrompt = taskList[selectedTask].prompt;
    parts.push('START: ' + taskPrompt);
    var targetLine = taskPrompt.replace(/^(Start|Execute|Deploy|Fix|Draft|Install|Close|Build|Create)\\s*/i, '').split(' — ')[0].split(' via ')[0];
    parts.push('TARGET: ' + targetLine + ' | CHAIN UNTIL DONE');
  } else {
    parts.push('START: NOTES ONLY \\u2014 no task selected');
  }
  var notes = getUserNotes();
  if (notes) parts.push('NOTES: ' + notes);
  if (checkedAQ.size > 0) {
    var seqItems = [];
    checkedAQ.forEach(function(idx) { seqItems.push(aq[idx].t); });
    parts.push('SEQUENCE: ' + seqItems.join(' | '));
  }
  if (selectedRadar.size > 0) {
    var apItems = [];
    selectedRadar.forEach(function(idx) {
      var it = radarData[idx];
      if (it) apItems.push('[' + it.type + '] ' + it.title);
    });
    if (apItems.length > 0) parts.push('APPROVED: ' + apItems.join(' | '));
  }
  var backtrackArmed = document.getElementById('backtrackBtn');
  if (backtrackArmed && backtrackArmed.dataset.armed === '1') {
    parts.push('CONTEXT RECOVERY: Read handoff for ' + (window.CEREMONY_PREV_SESSION || '') + ' from Akashic atlas/handoffs/' + (window.CEREMONY_PREV_SESSION || '') + '_HANDOFF.html');
  }
  return parts.join(' ||| ');
}


// === RENDER FUNCTIONS ===

function renderHealthTabs(tabs) {
  var hd = document.getElementById('healthTabs');
  if (!tabs || tabs.length === 0) {
    hd.innerHTML = '<div style="padding:8px 0;font-size:12px;color:var(--color-text-tertiary)">no pillar health data available</div>';
    return;
  }
  var bar = document.createElement('div');
  bar.style.cssText = 'display:flex;align-items:center;border-bottom:.5px solid var(--color-border-tertiary);margin-bottom:10px';
  var leftArr = document.createElement('div');
  leftArr.style.cssText = 'padding:8px 6px;cursor:pointer;color:var(--color-text-tertiary);font-size:12px;user-select:none';
  leftArr.textContent = '\\u25C0';
  var rightArr = document.createElement('div');
  rightArr.style.cssText = 'padding:8px 6px;cursor:pointer;color:var(--color-text-tertiary);font-size:12px;user-select:none';
  rightArr.textContent = '\\u25B6';
  var tabStrip = document.createElement('div');
  tabStrip.style.cssText = 'display:flex;flex:1;overflow-x:auto';
  var pan = document.createElement('div');
  pan.style.cssText = 'min-height:40px;margin-bottom:12px';
  var visStart = 0, maxVis = 7;
  function render() {
    tabStrip.innerHTML = '';
    var end = Math.min(visStart + maxVis, tabs.length);
    for (var i = visStart; i < end; i++) { (function(idx) {
      var t = tabs[idx];
      var b = document.createElement('div');
      b.style.cssText = 'padding:8px 14px;font-size:13px;cursor:pointer;color:var(--color-text-secondary);border-bottom:2px solid transparent;white-space:nowrap;display:flex;align-items:center;gap:4px';
      b.innerHTML = '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + t.c + '"></span>' + t.n;
      b.onclick = function() {
        tabStrip.querySelectorAll('div').forEach(function(x){x.style.color='var(--color-text-secondary)';x.style.borderBottomColor='transparent'});
        b.style.color='var(--color-text-primary)';b.style.borderBottomColor=t.c;
        pan.innerHTML = '<div style="display:flex;gap:16px;font-size:13px;padding:8px 0"><span><span style="font-weight:500">Last:</span> ' + t.last + ' (' + t.date + ')</span><span><span style="font-weight:500">Queue:</span> ' + t.q + '</span></div>';
      };
      if (idx === visStart) { b.style.color='var(--color-text-primary)';b.style.borderBottomColor=t.c; pan.innerHTML='<div style="display:flex;gap:16px;font-size:13px;padding:8px 0"><span><span style="font-weight:500">Last:</span> '+t.last+' ('+t.date+')</span><span><span style="font-weight:500">Queue:</span> '+t.q+'</span></div>'; }
      tabStrip.appendChild(b);
    })(i); }
    leftArr.style.opacity = visStart > 0 ? '1' : '0.3';
    rightArr.style.opacity = visStart + maxVis < tabs.length ? '1' : '0.3';
  }
  leftArr.onclick = function() { if (visStart > 0) { visStart--; render(); } };
  rightArr.onclick = function() { if (visStart + maxVis < tabs.length) { visStart++; render(); } };
  render();
  bar.appendChild(leftArr); bar.appendChild(tabStrip); bar.appendChild(rightArr);
  hd.appendChild(bar); hd.appendChild(pan);
}

function renderFutureOps(projects) {
  var foEl = document.getElementById('futureOps');
  if (!projects || projects.length === 0) {
    foEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:16px 0;font-size:12px;color:var(--color-text-tertiary);letter-spacing:.3px">nothing to report \\u2014 K\\u303D\\uFE0F\\u303D\\uFE0F</div>';
    return;
  }
  projects.forEach(function(item) {
    var card = document.createElement('div');
    card.style.cssText = 'border:.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:12px';
    var btn = document.createElement('button');
    btn.style.cssText = 'font-size:11px;cursor:pointer;background:transparent;border:.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);padding:4px 10px;color:var(--color-text-secondary)';
    btn.textContent = 'Start \\u2197';
    btn.addEventListener('click', function() { sendPrompt('START: ' + item.prompt); });
    card.innerHTML = '<div style="font-size:14px;font-weight:500;margin-bottom:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + item.color + ';margin-right:6px;vertical-align:middle"></span>' + item.emoji + ' ' + item.title + '</div><div style="font-size:12px;color:var(--color-text-secondary);margin-bottom:8px">' + item.desc + '</div>';
    card.appendChild(btn);
    foEl.appendChild(card);
  });
}

function renderSprints(sprints, sprintsDone) {
  var spTable = document.getElementById('sprintTable');
  if (!sprints || sprints.length === 0) {
    var emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="4" style="padding:12px 8px;text-align:center;font-size:12px;color:var(--color-text-tertiary);border-bottom:.5px solid var(--color-border-tertiary)">no active sprints</td>';
    spTable.appendChild(emptyRow);
  } else {
    sprints.forEach(function(s) {
      var pct = Math.round((s.done / s.total) * 100);
      var statusBg = s.status === 'on_track' ? 'var(--color-background-info)' : s.status === 'paused' ? 'var(--color-background-warning)' : 'var(--color-background-danger)';
      var statusColor = s.status === 'on_track' ? 'var(--color-text-info)' : s.status === 'paused' ? 'var(--color-text-warning)' : 'var(--color-text-danger)';
      var row = document.createElement('tr');
      row.innerHTML = '<td style="padding:8px;border-bottom:.5px solid var(--color-border-tertiary)"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:'+s.color+';margin-right:6px;vertical-align:middle"></span><span style="font-weight:500">'+s.emoji+' '+s.name+'</span></td><td style="padding:8px;border-bottom:.5px solid var(--color-border-tertiary)">'+s.done+'/'+s.total+'</td><td style="padding:8px;border-bottom:.5px solid var(--color-border-tertiary)"><div style="width:80px;height:5px;background:var(--color-background-secondary);border-radius:99px;overflow:hidden"><div style="width:'+pct+'%;height:100%;border-radius:99px;background:'+s.color+'"></div></div></td><td style="padding:8px;border-bottom:.5px solid var(--color-border-tertiary)"><span style="font-size:11px;padding:2px 8px;border-radius:99px;background:'+statusBg+';color:'+statusColor+'">'+s.status.replace('_',' ')+'</span></td></tr>';
      spTable.appendChild(row);
    });
  }
  var sdEl = document.getElementById('sprintDone');
  if (sprintsDone) { sprintsDone.forEach(function(s) { sdEl.innerHTML += s.emoji+' '+s.name+' '+s.done+'/'+s.total+' &#10003; '; }); }
}

function renderThreadsAndTargets(threads, targets) {
  var otEl = document.getElementById('openThreads');
  if (!threads || threads.length === 0) { otEl.innerHTML = '<div style="text-align:center;padding:12px 0;font-size:12px;color:var(--color-text-tertiary)">all threads closed \\u2014 K\\u303D\\uFE0F\\u303D\\uFE0F</div>'; }
  else { threads.forEach(function(item, idx) { buildTaskCard(item, otEl, 'threads', idx); }); }
  var stEl = document.getElementById('sessionTargets');
  if (!targets || targets.length === 0) { stEl.innerHTML = '<div style="text-align:center;padding:12px 0;font-size:12px;color:var(--color-text-tertiary)">no targets set \\u2014 use NOTES for direction</div>'; }
  else { targets.forEach(function(item, idx) { buildTaskCard(item, stEl, 'targets', idx); }); }
}

function renderRadar(radarData) {
  var radarEl = document.getElementById('radarItems');
  if (!radarData || radarData.length === 0) {
    radarEl.innerHTML = '<div style="text-align:center;padding:12px 0;font-size:12px;color:var(--color-text-tertiary)">KMM Radar\\u2122: scanned, nothing detected</div>';
    return;
  }
  radarData.forEach(function(item, idx) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:.5px solid var(--color-border-tertiary);cursor:pointer;transition:background .15s';
    var pillBg = item.type==='GP'?'#EEEDFE':item.type==='FM'?'#FAEEDA':item.type==='XP'?'#E6F1FB':'#E1F5EE';
    var pillColor = item.type==='GP'?'#534AB7':item.type==='FM'?'#854F0B':item.type==='XP'?'#185FA5':'#0F6E56';
    if (item.logged) {
      row.innerHTML = '<span style="font-size:14px;color:#BA7517;min-width:20px;text-align:center">&#11088;</span><span style="font-size:11px;padding:2px 8px;border-radius:99px;background:'+pillBg+';color:'+pillColor+'">'+item.type+'</span><div style="flex:1"><div style="font-size:13px;font-weight:500">'+item.title+'</div><div style="font-size:11px;color:var(--color-text-secondary)">'+item.desc+'</div><div style="font-size:11px;color:#BA7517;margin-top:2px">already logged</div></div>';
    } else {
      var ind = document.createElement('div');
      ind.style.cssText = 'width:18px;height:18px;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;border-radius:4px';
      ind.innerHTML = starOff;
      var content = document.createElement('div');
      content.style.cssText = 'flex:1';
      content.innerHTML = '<span style="font-size:11px;padding:2px 8px;border-radius:99px;background:'+pillBg+';color:'+pillColor+';margin-right:6px">'+item.type+'</span><span style="font-size:13px;font-weight:500">'+item.title+'</span><div style="font-size:11px;color:var(--color-text-secondary);margin-top:2px">'+item.desc+'</div>';
      row.appendChild(ind);
      row.appendChild(content);
      (function(i, indicator) {
        row.addEventListener('click', function() {
          if (selectedRadar.has(i)) { selectedRadar.delete(i); indicator.innerHTML = starOff; indicator.style.animation = 'none'; }
          else { selectedRadar.add(i); indicator.innerHTML = starOn; indicator.style.animation = 'goldFlash 0.5s ease-out 1'; }
        });
      })(idx, ind);
    }
    radarEl.appendChild(row);
  });
}

function renderActionQueue(aq, totalQueued) {
  var aqEl = document.getElementById('actionQueue');
  document.getElementById('aqShown').textContent = aq.length;
  if (!aq || aq.length === 0) {
    aqEl.innerHTML = '<div style="text-align:center;padding:12px 0;font-size:12px;color:var(--color-text-tertiary)">action queue empty \\u2014 clean slate</div>';
    return;
  }
  aq.forEach(function(item, idx) {
    var pillBg = item.p==='high'?'var(--color-background-success)':item.p==='critical'?'var(--color-background-danger)':'var(--color-background-warning)';
    var pillColor = item.p==='high'?'var(--color-text-success)':item.p==='critical'?'var(--color-text-danger)':'var(--color-text-warning)';
    var borderColor = item.p==='high'?'#1D9E75':item.p==='critical'?'#E24B4A':'#94A3B8';
    var card = document.createElement('div');
    card.style.cssText = 'border:.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);margin-bottom:5px;overflow:hidden;border-left:2px solid '+borderColor;
    var hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.style.cssText = 'width:16px;height:16px;accent-color:#1D9E75;cursor:pointer;flex-shrink:0;margin-right:8px';
    cb.addEventListener('click', function(e) { e.stopPropagation(); });
    cb.addEventListener('change', function() { if (this.checked) checkedAQ.add(idx); else checkedAQ.delete(idx); });
    var leftGroup = document.createElement('div');
    leftGroup.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1';
    leftGroup.appendChild(cb);
    var chevron = document.createElement('span');
    chevron.style.cssText = 'font-size:12px;color:var(--color-text-tertiary);transition:transform .2s';
    chevron.textContent = '\\u25B6';
    leftGroup.appendChild(chevron);
    var titleSpan = document.createElement('span');
    titleSpan.style.cssText = 'font-size:13px;font-weight:500';
    titleSpan.textContent = item.t;
    leftGroup.appendChild(titleSpan);
    var pill = document.createElement('span');
    pill.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:99px;background:'+pillBg+';color:'+pillColor+';flex-shrink:0';
    pill.textContent = item.p;
    hdr.appendChild(leftGroup); hdr.appendChild(pill);
    var body = document.createElement('div');
    body.style.cssText = 'padding:0 14px 10px 52px;font-size:12px;color:var(--color-text-secondary);line-height:1.6;display:none';
    var dateLine = document.createElement('div');
    dateLine.style.cssText = 'font-size:11px;color:var(--color-text-tertiary);margin-bottom:6px;display:flex;gap:6px;align-items:center';
    dateLine.innerHTML = '<span>'+(item.date||'')+'</span><span style="opacity:.4">\\u00B7</span><span>'+(item.age||'')+' ago</span><span style="opacity:.4">\\u00B7</span><span style="font-family:var(--font-mono);font-size:10px">'+(item.session||'')+'</span>';
    body.appendChild(dateLine);
    var descDiv = document.createElement('div');
    descDiv.style.cssText = 'margin-bottom:6px';
    descDiv.textContent = item.d;
    body.appendChild(descDiv);
    if (item.vs) {
      var vsDiv = document.createElement('div');
      vsDiv.style.cssText = 'padding:6px 10px;border-left:2px solid #7F77DD;background:var(--color-background-secondary);border-radius:0 var(--border-radius-md) var(--border-radius-md) 0;font-size:11px;line-height:1.5';
      vsDiv.innerHTML = '<span style="color:#7F77DD">&#128161;</span> ' + item.vs;
      body.appendChild(vsDiv);
    }
    hdr.addEventListener('click', function(e) {
      if (e.target === cb) return;
      var s = body.style.display !== 'none';
      body.style.display = s ? 'none' : 'block';
      chevron.style.transform = s ? 'rotate(0deg)' : 'rotate(90deg)';
    });
    card.appendChild(hdr); card.appendChild(body); aqEl.appendChild(card);
  });
}

function renderSectionCheck(requiredSections) {
  var bootReport = [];
  requiredSections.forEach(function(s) {
    var el = document.getElementById(s.id);
    var present = el && (el.children.length > 0 || el.innerHTML.trim().length > 0 || el.tagName === 'TEXTAREA');
    bootReport.push({section: s.name, rendered: present});
  });
  var missing = bootReport.filter(function(s) { return !s.rendered; });
  if (missing.length > 0) {
    var warn = document.createElement('div');
    warn.style.cssText = 'background:#FCEBEB;border:.5px solid #F7C1C1;border-radius:var(--border-radius-md);padding:8px 14px;margin:10px 0;font-size:12px;color:#A32D2D';
    warn.innerHTML = 'SECTION GAP: ' + missing.map(function(m) { return m.section; }).join(', ') + ' \\u2014 data arrays empty';
    document.querySelector('div').appendChild(warn);
  }
}


// === ARCANA WAVEFORM v04 ===

var arcanaMode = null;
var arcanaActive = false;

function selectArcana(mode) {
  if (arcanaActive) return;
  arcanaMode = mode;
  var ring = document.getElementById('arcanaRing');
  var crown = document.getElementById('arcanaCrown');
  var label = document.getElementById('arcanaLabel');
  var btn = document.getElementById('arcanaActivate');
  var swLabel = document.getElementById('arcanaLabelSW');
  var bcLabel = document.getElementById('arcanaLabelBC');

  ring.style.borderColor = 'rgba(186,117,23,0.5)';
  ring.style.boxShadow = '0 0 15px rgba(186,117,23,0.1)';
  crown.style.opacity = '0.9';
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
  btn.style.borderColor = 'rgba(186,117,23,0.5)';
  btn.style.color = '#BA7517';

  if (mode === 'sw') {
    label.textContent = 'SOUNDWAVES';
    label.style.color = '#7F77DD';
    swLabel.style.color = '#7F77DD';
    bcLabel.style.color = 'var(--color-text-tertiary)';
    document.getElementById('arcanaOrbSW').style.transform = 'scale(1.15)';
    document.getElementById('arcanaOrbBC').style.transform = 'scale(0.9)';
  } else {
    label.textContent = 'BEACON';
    label.style.color = '#BA7517';
    bcLabel.style.color = '#BA7517';
    swLabel.style.color = 'var(--color-text-tertiary)';
    document.getElementById('arcanaOrbBC').style.transform = 'scale(1.15)';
    document.getElementById('arcanaOrbSW').style.transform = 'scale(0.9)';
  }
}

function activateArcana() {
  if (!arcanaMode || arcanaActive) return;
  arcanaActive = true;
  var ring = document.getElementById('arcanaRing');
  var crown = document.getElementById('arcanaCrown');
  var btn = document.getElementById('arcanaActivate');
  var modeName = arcanaMode === 'sw' ? 'SOUNDWAVES' : 'BEACON';
  var modeEmoji = arcanaMode === 'sw' ? '\\uD83E\\uDEE7' : '\\uD83E\\uDE9E';
  var color = arcanaMode === 'sw' ? '#7F77DD' : '#BA7517';
  var side = arcanaMode === 'sw' ? 'L' : 'R';
  var bars = document.getElementById('arcanaBars'+side).children;

  ring.style.borderColor = color;
  ring.style.boxShadow = '0 0 20px ' + color + '33';
  crown.style.opacity = '1';
  crown.style.animation = 'arcanaSpin 1s cubic-bezier(.34,1.56,.64,1) 1';
  crown.querySelectorAll('path').forEach(function(p) { p.setAttribute('stroke', color); p.setAttribute('fill', color + '22'); });

  for (var b = 0; b < bars.length; b++) {
    bars[b].style.background = color;
    bars[b].style.animation = 'arcanaWaveform ' + (0.3 + Math.random() * 0.4) + 's ease-in-out infinite alternate';
    bars[b].style.animationDelay = (b * 0.08) + 's';
  }

  btn.textContent = modeEmoji + ' ' + modeName + ' \\u2014 LIVE';
  btn.style.background = color + '18';
  btn.style.borderColor = color;

  setTimeout(function() {
    sendPrompt('ARCANA ' + modeName + ' activated');
  }, 1200);
}


// === CEREMONY INIT ===
function ceremonyInit(data) {
  if (!data) return;
  
  // Render sections based on available data
  if (data.tabs && typeof renderHealthTabs === 'function') renderHealthTabs(data.tabs);
  if (typeof renderFutureOps === 'function') renderFutureOps(data.projects || []);
  if (typeof renderSprints === 'function') renderSprints(data.sprints || [], data.sprintsDone || []);
  if (typeof renderThreadsAndTargets === 'function') renderThreadsAndTargets(data.threads || [], data.targets || []);
  if (typeof renderRadar === 'function') renderRadar(data.radarData || []);
  if (typeof renderActionQueue === 'function') renderActionQueue(data.aq || [], data.aqTotal || 0);
  
  // Done list
  var dlEl = document.getElementById('doneList');
  if (dlEl && data.doneItems) {
    data.doneItems.forEach(function(item) {
      var div = document.createElement('div');
      var c = item.color || '#1D9E75';
      div.style.cssText = 'padding:8px 12px;border-left:3px solid '+c+';background:var(--color-background-secondary);border-radius:0 var(--border-radius-md) var(--border-radius-md) 0;margin-bottom:4px;font-size:13px;display:flex;justify-content:space-between;align-items:flex-start';
      div.innerHTML = '<div><span style="color:'+c+';margin-right:6px">\u2713</span><span style="font-weight:500">'+(item.title||'')+'</span>'+(item.desc?'<div style="font-size:11px;color:var(--color-text-secondary);margin-top:2px">'+item.desc+'</div>':'')+'</div>'+(item.time?'<span style="font-size:11px;color:var(--color-text-tertiary);white-space:nowrap;margin-left:8px">'+item.time+'</span>':'');
      dlEl.appendChild(div);
    });
  }
  
  // Directives
  var dc = document.getElementById('directivesContainer');
  if (dc && data.directives) {
    data.directives.forEach(function(dir) {
      var div = document.createElement('div');
      div.innerHTML = '\uD83D\uDD12 <span style="font-weight:500;color:#BA7517">' + (dir.name||'') + '</span> \u2014 ' + (dir.desc||'');
      dc.appendChild(div);
    });
    if (data.mcpEntries && data.mcpEntries.length > 0) {
      var mcpH = document.createElement('div');
      mcpH.style.cssText = 'margin-top:6px';
      mcpH.innerHTML = '\uD83D\uDD0C <span style="font-weight:500;color:#7F77DD">MCP REGISTRY</span>';
      dc.appendChild(mcpH);
      var mcpL = document.createElement('div');
      mcpL.style.cssText = 'padding-left:20px;font-size:12px;color:var(--color-text-secondary);line-height:1.6';
      data.mcpEntries.forEach(function(m) {
        var r = document.createElement('div');
        var sc = m.status === 'active' ? '#1D9E75' : '#BA7517';
        r.innerHTML = '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:'+sc+';margin-right:6px;vertical-align:middle"></span>'+m.name+' <span style="font-size:11px;color:var(--color-text-tertiary)">'+m.status+'</span>';
        mcpL.appendChild(r);
      });
      dc.appendChild(mcpL);
    }
  }
  
  // Backtrack
  var btBtn = document.getElementById('backtrackBtn');
  if (btBtn) {
    btBtn.dataset.armed = '0';
    btBtn.addEventListener('click', function() {
      if (btBtn.dataset.armed === '0') { btBtn.dataset.armed='1'; btBtn.style.borderColor='rgba(186,117,23,0.7)'; btBtn.style.boxShadow='0 0 8px rgba(186,117,23,0.2)'; btBtn.style.animation='spinUnlock 0.6s cubic-bezier(0.34,1.56,0.64,1) 1'; }
      else { btBtn.dataset.armed='0'; btBtn.style.borderColor='rgba(186,117,23,0.3)'; btBtn.style.boxShadow='none'; btBtn.style.animation='none'; }
    });
  }
  
  // Execute button
  var execBtn = document.getElementById('execBtn');
  if (execBtn) {
    execBtn.addEventListener('click', function() { sendPrompt(buildMergePayload()); });
    execBtn.addEventListener('mouseenter', function() { this.style.borderColor='rgba(127,119,221,0.7)'; });
    execBtn.addEventListener('mouseleave', function() { this.style.borderColor='rgba(127,119,221,0.4)'; });
  }
  
  // Section verification
  if (data.verifySections && typeof renderSectionCheck === 'function') {
    renderSectionCheck(data.verifySections);
  }
}
