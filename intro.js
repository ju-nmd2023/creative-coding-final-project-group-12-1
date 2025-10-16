let bgImg;

// button
let startButton = document.getElementById("start-button");

function preload() {
  bgImg = loadImage("img/Start_page_montserrat.png");
}

function setup() {
  const canvasContainer = createCanvas(1024, 768);
  canvasContainer.parent("canvas-holder");
}

startButton.addEventListener("click", function () {
  window.location.href = "puzzle.html";
});

function draw() {
  image(bgImg, 0, 0, width, height);
}
