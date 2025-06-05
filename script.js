// script.js
import { renderMasterTimeline } from './timeline.js';

let selectedDates = [];
let selectedTime = { start: 32, end: 48 }; // Default: 8 AM to 12 PM (15-min units)
let isDragging = false;
let startIndex = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const today = new Date();
today.setHours(0, 0, 0, 0);

const user = sessionStorage.getItem("fullName");
if (!user) window.location.href = "/login.html";
else document.getElementById("profileBox").textContent = user;

const mockCars = [
  { name: "Toyota Corolla", date: "2025-06-10", start: 32, end: 56 },
  { name: "Honda Civic", date: "2025-06-12", start: 40, end: 52 },
  { name: "Tesla Model 3", date: "2025-06-14", start: 48, end: 80 },
  { name: "Mazda CX-5", date: "2025-06-11", start: 68, end: 92 }
];

function formatHour(block) {
  const hour = Math.floor(block / 4);
  const minutes = (block % 4) * 15;
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const padded = minutes.toString().padStart(2, "0");
  return `${displayHour}:${padded} ${ampm}`;
}

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: "short", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options).replace(",", "");
}

function formatDate(date) {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

function renderRangeLabel() {
  const label = document.getElementById("selectedRangeLabel");
  if (selectedDates.length === 0) {
    label.textContent = "No date selected.";
    return;
  }
  const sorted = [...selectedDates].sort((a, b) => new Date(a) - new Date(b));
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const multiple = sorted.length > 1;
  label.textContent = multiple
    ? `${formatDateDisplay(start)} at ${formatHour(selectedTime.start)} to ${formatDateDisplay(end)} at ${formatHour(selectedTime.end)}`
    : `${formatDateDisplay(start)}, ${formatHour(selectedTime.start)} to ${formatHour(selectedTime.end)}`;
}

function renderMonthCalendar(year, month) {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayISO = formatDate(today);

  for (let i = 0; i < firstDay + daysInMonth; i++) {
    const div = document.createElement("div");
    div.classList.add("grid-date");
    if (i >= firstDay) {
      const date = new Date(year, month, i - firstDay + 1);
      const iso = formatDate(date);
      div.dataset.date = iso;
      div.textContent = date.getDate();

      if (selectedDates.includes(iso)) div.classList.add("selected");
      if (iso === todayISO) div.classList.add("today");
      if (date < today) div.classList.add("disabled");

      div.addEventListener("mousedown", () => {
        if (date >= today) {
          isDragging = true;
          startIndex = i;
          selectedDates = [iso];
          rerenderAll();
        }
      });

      div.addEventListener("mouseenter", () => {
        if (isDragging && date >= today) {
          const range = [];
          for (let j = Math.min(startIndex, i); j <= Math.max(startIndex, i); j++) {
            const d = new Date(year, month, j - firstDay + 1);
            if (d >= today) range.push(formatDate(d));
          }
          selectedDates = range;
          rerenderAll();
        }
      });

      div.addEventListener("mouseup", () => {
        isDragging = false;
        startIndex = null;
      });
    }
    grid.appendChild(div);
  }

  document.getElementById("monthLabel").textContent = new Date(year, month).toLocaleDateString("default", { month: "long", year: "numeric" });
  document.getElementById("prevMonth").disabled = (month <= today.getMonth() && year === today.getFullYear());
}

function rerenderAll() {
  renderMonthCalendar(currentYear, currentMonth);
  renderRangeLabel();
  renderMasterTimeline(selectedDates, selectedTime, rerenderAll);
  renderCars();
}

window.rerenderAll = rerenderAll;
window.selectedDates = selectedDates;
window.selectedTime = selectedTime;

// Calendar controls
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevMonth").addEventListener("click", () => {
    if (currentMonth > 0) currentMonth--;
    else {
      currentMonth = 11;
      currentYear--;
    }
    rerenderAll();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    if (currentMonth < 11) currentMonth++;
    else {
      currentMonth = 0;
      currentYear++;
    }
    rerenderAll();
  });

  rerenderAll();
});
