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
else document.getElementById("profileName").textContent = user;

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

function renderCars() {
  const list = document.getElementById("carList");
  if (!list) return;
  list.innerHTML = "";

  mockCars.forEach((car) => {
    const card = document.createElement("div");
    card.classList.add("car-card");

    const title = document.createElement("h3");
    title.textContent = car.name;
    card.appendChild(title);

    const date = document.createElement("p");
    date.textContent = formatDateDisplay(car.date);
    card.appendChild(date);

    const timeline = document.createElement("div");
    timeline.classList.add("timeline");
    timeline.style.position = "relative";

    const available = document.createElement("div");
    available.classList.add("segment", "available");
    available.style.left = `${(car.start / 96) * 100}%`;
    available.style.width = `${((car.end - car.start) / 96) * 100}%`;
    timeline.appendChild(available);

    if (selectedDates.includes(car.date)) {
      const userStart = selectedTime.start * 4;
      const userEnd = selectedTime.end * 4;
      const overlay = document.createElement("div");
      overlay.classList.add("overlay");
      overlay.style.left = `${(userStart / 96) * 100}%`;
      overlay.style.width = `${((userEnd - userStart) / 96) * 100}%`;
      const fullMatch = userStart >= car.start && userEnd <= car.end;
      overlay.style.background = fullMatch ? "var(--green)" : "var(--red)";
      card.classList.add(fullMatch ? "full" : "partial");
      timeline.appendChild(overlay);
    }

    card.appendChild(timeline);

    const details = document.createElement("div");
    details.style.display = "none";
    const interactive = document.createElement("div");
    interactive.classList.add("timeline");
    interactive.style.position = "relative";
    const reserve = document.createElement("button");
    reserve.textContent = "Reserve";
    reserve.disabled = true;
    details.appendChild(interactive);
    details.appendChild(reserve);
    card.appendChild(details);

    function updateOverlay() {
      interactive.innerHTML = "";
      const avail = document.createElement("div");
      avail.classList.add("segment", "available");
      avail.style.left = `${(car.start / 96) * 100}%`;
      avail.style.width = `${((car.end - car.start) / 96) * 100}%`;
      interactive.appendChild(avail);

      const overlay = document.createElement("div");
      overlay.classList.add("overlay");
      overlay.style.left = `${(selectedTime.start * 4 / 96) * 100}%`;
      overlay.style.width = `${((selectedTime.end - selectedTime.start) * 4 / 96) * 100}%`;
      const match = selectedTime.start * 4 >= car.start && selectedTime.end * 4 <= car.end;
      overlay.style.background = match ? "var(--green)" : "var(--red)";
      reserve.disabled = !match;

      const leftHandle = document.createElement("div");
      const rightHandle = document.createElement("div");
      [leftHandle, rightHandle].forEach(h => {
        h.style.width = "8px";
        h.style.height = "100%";
        h.style.background = "#000";
        h.style.position = "absolute";
        h.style.top = 0;
        h.style.cursor = "ew-resize";
      });
      leftHandle.style.left = 0;
      rightHandle.style.right = 0;
      overlay.appendChild(leftHandle);
      overlay.appendChild(rightHandle);
      interactive.appendChild(overlay);

      let drag = false;
      let resize = false;
      let side = null;
      let startX = 0;
      let initialLeft = 0;
      let initialWidth = 0;

      overlay.addEventListener("mousedown", e => {
        if (e.target === leftHandle || e.target === rightHandle) {
          resize = true;
          side = e.target === leftHandle ? "left" : "right";
        } else {
          drag = true;
        }
        startX = e.clientX;
        initialLeft = overlay.offsetLeft;
        initialWidth = overlay.offsetWidth;
        e.preventDefault();
      });

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", end);

      function move(e) {
        if (!drag && !resize) return;
        const width = interactive.offsetWidth;
        const step = width / 96;
        if (drag) {
          let newLeft = initialLeft + (e.clientX - startX);
          newLeft = Math.max(0, Math.min(newLeft, width - overlay.offsetWidth));
          newLeft = Math.round(newLeft / step) * step;
          overlay.style.left = `${newLeft}px`;
          selectedTime.start = Math.round(newLeft / step) / 4;
          selectedTime.end = selectedTime.start + initialWidth / step / 4;
        } else if (resize) {
          if (side === "left") {
            let newLeft = initialLeft + (e.clientX - startX);
            let newWidth = initialWidth - (e.clientX - startX);
            if (newLeft >= 0 && newWidth >= step) {
              newLeft = Math.round(newLeft / step) * step;
              newWidth = Math.round(newWidth / step) * step;
              overlay.style.left = `${newLeft}px`;
              overlay.style.width = `${newWidth}px`;
              selectedTime.start = Math.round(newLeft / step) / 4;
              selectedTime.end = Math.round((newLeft + newWidth) / step) / 4;
            }
          } else {
            let newWidth = initialWidth + (e.clientX - startX);
            if (initialLeft + newWidth <= width && newWidth >= step) {
              newWidth = Math.round(newWidth / step) * step;
              overlay.style.width = `${newWidth}px`;
              selectedTime.end = Math.round((initialLeft + newWidth) / step) / 4;
            }
          }
        }
        const good = selectedTime.start * 4 >= car.start && selectedTime.end * 4 <= car.end;
        overlay.style.background = good ? "var(--green)" : "var(--red)";
        reserve.disabled = !good;
      }

      function end() {
        drag = false;
        resize = false;
      }
    }

    updateOverlay();

    card.addEventListener("click", () => {
      if (details.style.display === "none") {
        details.style.display = "block";
        updateOverlay();
      } else {
        details.style.display = "none";
      }
    });

    list.appendChild(card);
  });
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
