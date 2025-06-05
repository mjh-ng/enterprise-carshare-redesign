// timeline.js — draggable time selection bar with labeling logic
export function renderMasterTimeline(selectedDates, selectedTime, rerenderAll) {
    const timeSelector = document.getElementById("timeSelector");
    timeSelector.innerHTML = "";
    if (!selectedDates || selectedDates.length === 0) return;
  
    const totalQuarters = selectedDates.length === 1 ? 96 : 24 * selectedDates.length;
    const block = document.createElement("div");
    block.classList.add("timeline-bar");

    const startQ = selectedTime.start * (selectedDates.length === 1 ? 4 : 1);
    const endQ = selectedTime.end * (selectedDates.length === 1 ? 4 : 1);
    block.style.left = `${(startQ / totalQuarters) * 100}%`;
    block.style.width = `${((endQ - startQ) / totalQuarters) * 100}%`;
  
    const container = document.createElement("div");
    container.classList.add("timeline");
    container.style.position = "relative";
  
    const leftHandle = document.createElement("div");
    const rightHandle = document.createElement("div");
    leftHandle.classList.add("handle", "left");
    rightHandle.classList.add("handle", "right");
  
    block.appendChild(leftHandle);
    block.appendChild(rightHandle);
    container.appendChild(block);
  
    // Labels ABOVE the bar
    const topLabelBar = document.createElement("div");
    topLabelBar.classList.add("timeline-labels-top");
    if (selectedDates.length === 1) {
      for (let h = 0; h <= 24; h += 6) {
        const q = h * 4;
        const label = document.createElement("div");
        label.classList.add("label-top");
        label.style.left = `${(q / totalQuarters) * 100}%`;
        if (h === 0 || h === 24) label.textContent = "12am";
        else if (h === 12) label.textContent = "Noon";
        else label.textContent = `${h % 12}${h < 12 ? 'am' : 'pm'}`;
        topLabelBar.appendChild(label);
      }
    } else {
      selectedDates.forEach((d, idx) => {
        const q = idx * 24;
        const label = document.createElement("div");
        label.classList.add("label-top");
        label.style.left = `${(q / totalQuarters) * 100}%`;
        const dateObj = new Date(d);
        label.textContent = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        topLabelBar.appendChild(label);
      });
    }
    container.appendChild(topLabelBar);
  
    // Labels BELOW the bar
    const bottomLabelBar = document.createElement("div");
    bottomLabelBar.classList.add("timeline-labels-bottom");
    const startRatio = startQ / totalQuarters;
    const endRatio = endQ / totalQuarters;
  
    const startLabel = document.createElement("div");
    startLabel.classList.add("label-bottom");
    startLabel.style.left = `${startRatio * 100}%`;
    startLabel.textContent = formatHour(selectedTime.start, selectedDates.length);
  
    const endLabel = document.createElement("div");
    endLabel.classList.add("label-bottom");
    endLabel.style.left = `${endRatio * 100}%`;
    endLabel.textContent = formatHour(selectedTime.end, selectedDates.length);
  
    bottomLabelBar.appendChild(startLabel);
    bottomLabelBar.appendChild(endLabel);
    container.appendChild(bottomLabelBar);
  
    timeSelector.appendChild(container);
  
    let isDragging = false;
    let dragStartX = 0;
    let initialLeft = 0;
    let isResizing = false;
    let resizeSide = null;
  
    block.addEventListener("mousedown", (e) => {
      if (e.target === leftHandle || e.target === rightHandle) {
        isResizing = true;
        resizeSide = e.target === leftHandle ? "left" : "right";
      } else {
        isDragging = true;
        dragStartX = e.clientX;
        initialLeft = block.offsetLeft;
      }
      e.preventDefault();
    });
  
    window.addEventListener("mousemove", (e) => {
      if (!isDragging && !isResizing) return;
      const parentWidth = container.offsetWidth;
      const dx = e.clientX - dragStartX;
  
      const increment = parentWidth / totalQuarters;
      if (isDragging) {
        let newLeft = initialLeft + dx;
        newLeft = Math.max(0, Math.min(newLeft, parentWidth - block.offsetWidth));
        newLeft = Math.round(newLeft / increment) * increment;
        block.style.left = `${(newLeft / parentWidth) * 100}%`;
        const newStart = Math.round((newLeft / parentWidth) * totalQuarters);
        const duration = Math.round((block.offsetWidth / parentWidth) * totalQuarters);
        selectedTime.start = selectedDates.length === 1 ? newStart / 4 : newStart;
        selectedTime.end = selectedDates.length === 1 ? (newStart + duration) / 4 : (newStart + duration);
      } else if (isResizing) {
        const rect = block.getBoundingClientRect();
        if (resizeSide === "left") {
          let newLeft = e.clientX - container.getBoundingClientRect().left;
          let newWidth = rect.right - e.clientX;
          if (newLeft >= 0 && newWidth >= 10) {
            newLeft = Math.round(newLeft / increment) * increment;
            newWidth = Math.round(newWidth / increment) * increment;
            block.style.left = `${(newLeft / parentWidth) * 100}%`;
            block.style.width = `${(newWidth / parentWidth) * 100}%`;
          }
        } else {
          let newWidth = e.clientX - rect.left;
          if (newWidth >= 10 && rect.left + newWidth <= container.getBoundingClientRect().right) {
            newWidth = Math.round(newWidth / increment) * increment;
            block.style.width = `${(newWidth / parentWidth) * 100}%`;
          }
        }
        const leftRatio = parseFloat(block.style.left) / 100;
        const widthRatio = parseFloat(block.style.width) / 100;
        const newStart = Math.round(leftRatio * totalQuarters);
        const newEnd = Math.round((leftRatio + widthRatio) * totalQuarters);
        selectedTime.start = selectedDates.length === 1 ? newStart / 4 : newStart;
        selectedTime.end = selectedDates.length === 1 ? newEnd / 4 : newEnd;
      }
      rerenderAll();
    });
  
    window.addEventListener("mouseup", () => {
      isDragging = false;
      isResizing = false;
    });
  }
  
  function formatHour(block, days) {
    const adjusted = days === 1 ? block / 4 : block;
    const hour = Math.floor(adjusted);
    const minutes = Math.round((adjusted % 1) * 60);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }
  