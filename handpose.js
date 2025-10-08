let handpose;
let video;
let hands = [];
let bgImg;

// ### lips ###
// array for the positions of normalized coordianates
const puzzleDots = [
  { x: 0.46, y: 0.665 }, // 1
  { x: 0.485, y: 0.68 }, // 2
  { x: 0.515, y: 0.665 }, // 3
  { x: 0.56, y: 0.71 }, // 4
  { x: 0.515, y: 0.765 }, // 5
  { x: 0.45, y: 0.765 }, // 6
  { x: 0.4, y: 0.71 }, // 7
  { x: 0.45, y: 0.665 }, // 8
];

// array to fill the pixel coordinates
let puzzleDotsPixels = [];

// diameter of the dot drawn
let dotDiameter = 12;

function preload() {
  handpose = ml5.handPose();
  bgImg = loadImage("img/placeholder-background.png");
}

function setup() {
  createCanvas(1024, 768);

  calculateDotPixels();
  // check the calculation pixel calculation
  // console.log("puzzleDotsPixels:", puzzleDotsPixels);

  video = createCapture(VIDEO);
  video.size(1024, 768);
  video.hide();

  handpose.detectStart(video, getHandsData);
}

function draw() {
  // background used for tests
  //   background(255, 251, 189);

  // ########## Check out this part ##########
  // ########## Uncomment lines to test ##########
  // various tints that change how the images is seen
  // uncomment each version

  // red
  //   tint(255, 0, 0);

  // green
  //   tint(0, 255, 0);

  // blue
  // tint(0, 0, 255);

  // make the background png darker, reveal each part stepwise?
  //   background(0);
  //   tint(255, 50);

  // ########## End of test ###########

  image(bgImg, 0, 0, width, height);

  drawDots();

  // mirror for a natural feel
  push();
  translate(width, 0);
  scale(-1, 1);

  //   un-comment this to see the camera
  //   image(video, 0, 0, width, height);

  if (hands.length > 0) {
    let indexFinger = hands[0].index_finger_tip;
    push();
    fill(255, 255, 255);

    ellipse(indexFinger.x, indexFinger.y, 10);
    pop();
  }
  pop();
}

// console.log the normalized coordinates values (rounded to 3 decimals)
// function mousePressed() {
//   const xn = +(mouseX / width).toFixed(3);
//   const yn = +(mouseY / height).toFixed(3);
//   console.log(`{ x: ${xn}, y: ${yn} },`);
// }

function calculateDotPixels() {
  puzzleDotsPixels = [];

  // fills the new array with pixel coordinates
  for (let i = 0; i < puzzleDots.length; i++) {
    const dot = puzzleDots[i];
    const xPixel = dot.x * width;
    const yPixel = dot.y * height;
    puzzleDotsPixels.push({ x: xPixel, y: yPixel });
  }
}

function drawDots() {
  noStroke();
  fill(255, 255, 255);
  textAlign(CENTER, CENTER);
  textSize(12);

  for (let i = 0; i < puzzleDotsPixels.length; i++) {
    // current dot position
    const dot = puzzleDotsPixels[i];

    ellipse(dot.x, dot.y, dotDiameter);

    fill(0, 0, 0);
    text(i + 1, dot.x, dot.y);

    fill(255, 255, 255, 150);
  }
}

function getHandsData(results) {
  hands = results;
}
