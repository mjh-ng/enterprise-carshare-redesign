const timelineContainer = document.getElementById("main-timeline");
const timeLabels = document.getElementById("time-labels");

let timelineStart = null;
let timelineEnd = null;

let timeStart = null;
let timeEnd = null;

// Called whenever dates change
function renderTimeline() {
  const dates = getSelectedDates();
  if (!dates.length) {
    timelineContainer.innerHTML = "";
    timeLabels.innerHTML = "";
    return;
  }

  const sorted = [...dates].sort((a, b) => a - b);
  timelineStart = new Date(sorted[0]);
  timelineStart.setHours(0, 0, 0, 0);
  timelineEnd = new Date(sorted[sorted.length - 1]);
  timelineEnd.setHours(24, 0, 0, 0);

  const durationMs = timelineEnd - timelineStart;
  const singleDay = sorted.length === 1;
  const incrementMs = singleDay ? 15 * 60 * 1000 : 60 * 60 * 1000;

  const totalIncrements = durationMs / incrementMs;

  timelineContainer.innerHTML = "";
  timeLabels.innerHTML = "";

  const drag = document.createElement("div");
  drag.className = "drag-bar";
  const handleL = document.createElement("div");
  handleL.className = "drag-handle";
  const handleR = document.createElement("div");
  handleR.className = "drag-handle";

  drag.appendChild(handleL);
  drag.appendChild(handleR);
  timelineContainer.appendChild(drag);

  let dragging = false;
  let activeHandle = null;
  let dragStartX = 0;
  let dragStartLeft = 0;
  let dragStartRight = 0;

  const width = timelineContainer.offsetWidth;

  // Initial placement
  let startIndex = Math.floor(totalIncrements / 3);
  let endIndex = startIndex + Math.max(2, Math.floor(totalIncrements / 6));

  function setBar() {
    const left = (startIndex / totalIncrements) * width;
    const right = (endIndex / totalIncrements) * width;
    drag.style.left = `${left}px`;
    drag.style.width = `${right - left}px`;

    timeStart = new Date(timelineStart.getTime() + incrementMs * startIndex);
    timeEnd = new Date(timelineStart.getTime() + incrementMs * endIndex);
    renderTimeLabels();
    renderCars();
  }

  function snapToIncrement(px) {
    const percent = px / width;
    return Math.round(percent * totalIncrements);
  }

  handleL.onmousedown = (e) => {
    dragging = true;
    activeHandle = "left";
    dragStartX = e.clientX;
    dragStartLeft = startIndex;
    document.onmousemove = move;
    document.onmouseup = stop;
  };

  handleR.onmousedown = (e) => {
    dragging = true;
    activeHandle = "right";
    dragStartX = e.clientX;
    dragStartRight = endIndex;
    document.onmousemove = move;
    document.onmouseup = stop;
  };

  drag.onmousedown = (e) => {
    if (e.target === handleL || e.target === handleR) return;
    dragging = true;
    activeHandle = "move";
    dragStartX = e.clientX;
    dragStartLeft = startIndex;
    dragStartRight = endIndex;
    document.onmousemove = move;
    document.onmouseup = stop;
  };

  function move(e) {
    const dx = e.clientX - dragStartX;
    const delta = snapToIncrement(dx);
    if (activeHandle === "left") {
      startIndex = Math.min(dragStartRight - 1, Math.max(0, dragStartLeft + delta));
    } else if (activeHandle === "right") {
      endIndex = Math.max(dragStartLeft + 1, Math.min(totalIncrements, dragStartRight + delta));
    } else if (activeHandle === "move") {
      const width = dragStartRight - dragStartLeft;
      let newStart = dragStartLeft + delta;
      let newEnd = newStart + width;
      if (newStart < 0) {
        newStart = 0;
        newEnd = width;
      }
      if (newEnd > totalIncrements) {
        newEnd = totalIncrements;
        newStart = endIndex - width;
      }
      startIndex = newStart;
      endIndex = newEnd;
    }
    setBar();
  }

  function stop() {
    dragging = false;
    document.onmousemove = null;
    document.onmouseup = null;
  }

  // Initial render
  setBar();
}

// Helper to display time below + date above
function renderTimeLabels() {
  timeLabels.innerHTML = "";

  const dates = getSelectedDates();
  if (!dates.length) return;

  const multi = dates.length > 1;
  const single = dates.length === 1;

  // Top labels (dates / 12am / noon)
  const top = document.createElement("div");
  top.style.width = "100%";
  top.style.display = "flex";
  top.style.justifyContent = "space-between";
  top.style.fontSize = "0.7rem";
  top.style.marginBottom = "4px";

  const bottom = document.createElement("div");
  bottom.style.width = "100%";
  bottom.style.display = "flex";
  bottom.style.justifyContent = "space-between";
  bottom.style.fontSize = "0.8rem";

  const startStr = formatTimeLabel(timeStart);
  const endStr = formatTimeLabel(timeEnd);

  if (single) {
    top.innerHTML = `<div>12am</div><div>noon</div><div>midnight</div>`;
  } else {
    const span = (d) => `${d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}`;
    top.innerHTML = dates.length <= 3
      ? dates.map(d => `<div>${span(d)}</div>`).join("")
      : `<div>${span(dates[0])} — ${span(dates[dates.length - 1])}</div>`;
  }

  bottom.innerHTML = `<div>${startStr}</div><div>${endStr}</div>`;

  timeLabels.appendChild(top);
  timeLabels.appendChild(bottom);
}

function formatTimeLabel(date) {
  return date.toLocaleString("en-US", {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric'
  });
}

// Accessor for external use (e.g. cars.js)
function getSelectedTimeRange() {
  return { timeStart, timeEnd };
}
