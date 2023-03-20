var map = L.map("map").setView([55, 10], 4);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  minZoom: 3,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
const apartmentsCords = document.querySelectorAll(".apartment-cords");
console.log(apartmentsCords);
apartmentsCords.forEach((cords) => {
  const marker = L.marker([cords.dataset["lat"], cords.dataset["long"]]).addTo(
    map
  );
});
