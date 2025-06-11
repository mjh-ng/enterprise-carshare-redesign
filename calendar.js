const calendarContainer = document.getElementById("calendar-container");

let selectedDates = [];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MS_PER_DAY = 86400000;

function renderCalendar() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

  calendarContainer.innerHTML = "";

  // Weekday headers
  DAYS_OF_WEEK.forEach(day => {
    const label = document.createElement("div");
    label.textContent = day;
    label.style.fontWeight = "bold";
    calendarContainer.appendChild(label);
  });

  // Padding for start of month
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    calendarContainer.appendChild(document.createElement("div"));
  }

  // Render current month days
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const date = new Date(currentYear, currentMonth, d);
    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day";
    dayBox.textContent = d;

    if (isPast(date, today)) {
      dayBox.classList.add("past");
    } else {
      dayBox.addEventListener("mousedown", () => startDrag(date));
      dayBox.addEventListener("mouseenter", () => dragHover(date));
      dayBox.addEventListener("mouseup", () => endDrag(date));
    }

    if (isSelected(date)) {
      dayBox.classList.add("selected");
    }

    calendarContainer.appendChild(dayBox);
  }

  // Extra: first 7 days of next month if last day selected
  if (selectedDates.length) {
    const lastSelected = selectedDates[selectedDates.length - 1];
    if (lastSelected.getDate() === lastDayOfMonth.getDate()) {
      for (let i = 1; i <= 7; i++) {
        const date = new Date(currentYear, currentMonth + 1, i);
        const dayBox = document.createElement("div");
        dayBox.className = "calendar-day";
        dayBox.textContent = i;
        dayBox.addEventListener("mousedown", () => startDrag(date));
        dayBox.addEventListener("mouseenter", () => dragHover(date));
        dayBox.addEventListener("mouseup", () => endDrag(date));

        if (isSelected(date)) {
          dayBox.classList.add("selected");
        }

        calendarContainer.appendChild(dayBox);
      }
    }
  }
}

function isPast(date, today) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d < t;
}

function isSameDate(a, b) {
  return a.toDateString() === b.toDateString();
}

function isSelected(date) {
  return selectedDates.some(d => isSameDate(d, date));
}

// --- Drag-to-select logic ---
let dragging = false;
let dragStart = null;

function startDrag(date) {
  dragging = true;
  dragStart = date;
  selectedDates = [date];
  renderCalendar();
}

function dragHover(date) {
  if (!dragging) return;
  selectedDates = getDateRange(dragStart, date);
  renderCalendar();
}

function endDrag(date) {
  if (!dragging) return;
  selectedDates = getDateRange(dragStart, date);
  dragging = false;
  dragStart = null;
  renderCalendar();
  onDateSelectionChange(); // Notify other components
}

function getDateRange(start, end) {
  const range = [];
  let current = new Date(start);
  const target = new Date(end);

  const dir = current <= target ? 1 : -1;
  while (true) {
    range.push(new Date(current));
    if (isSameDate(current, target)) break;
    current.setDate(current.getDate() + dir);
  }
  return range.sort((a, b) => a - b);
}

// Hook for other files
function getSelectedDates() {
  return selectedDates;
}

function onDateSelectionChange() {
  renderTimeline(); // from timeline.js
  renderCars();     // from cars.js
}

renderCalendar();
