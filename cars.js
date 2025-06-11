const carList = document.getElementById("car-list");

// Demo data for now — availability ranges (can later come from a DB)
const cars = [
  {
    id: 1,
    name: "Toyota Corolla",
    lot: "Lot A",
    availability: [
      { start: hoursFromNow(0), end: hoursFromNow(24 * 3) },
    ]
  },
  {
    id: 2,
    name: "Honda Civic",
    lot: "Lot B",
    availability: [
      { start: hoursFromNow(12), end: hoursFromNow(24 * 2 + 6) },
    ]
  },
  {
    id: 3,
    name: "Ford Focus",
    lot: "Lot C",
    availability: [
      { start: hoursFromNow(36), end: hoursFromNow(72) },
    ]
  }
];

function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600000);
}

function renderCars() {
  const dates = getSelectedDates();
  const { timeStart, timeEnd } = getSelectedTimeRange();
  carList.innerHTML = "";

  if (!dates.length || !timeStart || !timeEnd) return;

  cars.forEach(car => {
    const box = document.createElement("div");
    box.className = "car-box";
    box.innerHTML = `<strong>${car.name}</strong> <br><span>${car.lot}</span>`;

    const bar = document.createElement("div");
    bar.className = "car-timeline";

    const availabilityLayer = document.createElement("div");
    availabilityLayer.className = "car-availability";
    availabilityLayer.style.left = "0";
    availabilityLayer.style.width = "100%";
    bar.appendChild(availabilityLayer);

    const totalMs = timeEnd - timeStart;
    let match = availabilityMatch(car, timeStart, timeEnd);

    const dragOverlay = document.createElement("div");
    dragOverlay.className = "car-drag-bar";
    if (!match.full) dragOverlay.classList.add("partial");

    const startFrac = (timeStart - timelineStart) / (timelineEnd - timelineStart);
    const endFrac = (timeEnd - timelineStart) / (timelineEnd - timelineStart);
    dragOverlay.style.left = `${startFrac * 100}%`;
    dragOverlay.style.width = `${(endFrac - startFrac) * 100}%`;
    bar.appendChild(dragOverlay);

    box.appendChild(bar);

    box.onclick = () => expandCar(car, match.full, timeStart, timeEnd);

    carList.appendChild(box);
  });
}

function availabilityMatch(car, start, end) {
  for (const range of car.availability) {
    if (start >= range.start && end <= range.end) return { full: true };
  }
  return { full: false };
}

function expandCar(car, isFullMatch, start, end) {
  const durationHours = Math.round((end - start) / 3600000);
  const cost = durationHours * 6;

  const box = document.createElement("div");
  box.className = "car-box expanded";
  box.innerHTML = `
    <strong>${car.name}</strong><br>
    <span>${car.lot}</span><br><br>
    <div class="car-timeline"></div>
    <p>Selected: ${formatTimeLabel(start)} to ${formatTimeLabel(end)}</p>
    <p>Estimated Cost: $${cost}</p>
    ${isFullMatch ? '<button onclick="reserveCar()">Reserve</button>' : '<p style="color:red">Selected time not fully available.</p>'}
  `;

  carList.innerHTML = "";
  carList.appendChild(box);
}

function reserveCar() {
  alert("Car reserved! (this would trigger DB logic later)");
}
