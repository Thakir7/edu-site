/***************
 * 1) رابط Apps Script Web App
 ***************/
const API_URL = "https://script.google.com/macros/s/AKfycbw2LRgNheF2j1-b0R7SoLXgIirYyEc49AOoY6RJ33kKkA8jpuGFO3ByvdQ5CeKr7BNZMg/exec";

/***************
 * 2) أدوات عامة
 ***************/
function qs(id){ return document.getElementById(id); }

function setText(id, v){
  const el = qs(id);
  if (!el) return;
  const txt = (v !== undefined && v !== null && String(v).trim() !== "") ? v : "-";
  el.textContent = txt;
}

function showError(id, msg){
  const el = qs(id);
  if (!el) return;
  el.textContent = msg || "";
  el.style.display = msg ? "block" : "none";
}

/***************
 * 3) Session
 ***************/
function saveSession(trainee){
  localStorage.setItem("trainee_session", JSON.stringify(trainee));
}

function getSession(){
  const raw = localStorage.getItem("trainee_session");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function clearSession(){
  localStorage.removeItem("trainee_session");
}

function requireSession(){
  const s = getSession();
  if (!s || !s.id) {
    window.location.href = "index.html";
    return null;
  }
  return s;
}

/***************
 * 4) Header helpers
 ***************/
function renderHeaderSession(){
  const s = getSession();
  if (!s) return;
  setText("vName", s.name);
  setText("vId", s.id);
  setText("vAdvisor", s.advisor);
}

// ✅ alias لتوافق dashboard.html
function fillHeaderFromSession(){
  renderHeaderSession();
}

/***************
 * 5) API
 ***************/
async function apiGet(params){
  if (!API_URL || !API_URL.startsWith("http")) throw new Error("API_URL not set");

  // ✅ كسر الكاش
  params._t = Date.now();

  const url = API_URL + "?" + new URLSearchParams(params).toString();
  const res = await fetch(url, { method:"GET" });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("API did not return JSON: " + text.slice(0, 120));
  }
}

/***************
 * 6) البحث عن متدرب
 ***************/
async function searchTraineeById(id){
  const data = await apiGet({ action:"trainee", id });
  if (data?.ok && data?.trainee) return data.trainee;
  return null;
}

/***************
 * 7) خدمات
 ***************/
async function getSchedule(id){
  return await apiGet({ action:"schedule", id });
}
async function getActivities(id){
  return await apiGet({ action:"activities", id });
}
async function getExcuses(id){
  return await apiGet({ action:"excuses", id });
}
async function getViolations(id){
  return await apiGet({ action:"violations", id });
}

// ✅ لأن Code.gs لا يدعم action=profile/contact
async function getProfile(id){
  return await apiGet({ action:"trainee", id });
}
async function getContact(id){
  return await apiGet({ action:"trainee", id });
}

/***************
 * 8) تعبئة جدول من JSON
 ***************/
function renderTable(tableId, columns, rows){
  const table = qs(tableId);
  if (!table) return;

  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  if (!thead || !tbody) return;

  thead.innerHTML = "";
  tbody.innerHTML = "";

  // header
  const trh = document.createElement("tr");
  columns.forEach(c=>{
    const th = document.createElement("th");
    th.textContent = c.label;
    trh.appendChild(th);
  });
  thead.appendChild(trh);

  // body
  if (!rows || !rows.length){
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = columns.length;
    td.textContent = "لا توجد بيانات.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(r=>{
    const tr = document.createElement("tr");
    columns.forEach(c=>{
      const td = document.createElement("td");
      td.textContent = (r[c.key] ?? "").toString();
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
