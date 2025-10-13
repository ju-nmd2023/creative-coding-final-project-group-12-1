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

// radius of the dot drawn
let dotRadius = dotDiameter / 2;

// how close the finger must be
let hitRadius = dotRadius * 1.1;

// index of the next dot to reach
let currentDot = 0;

// array for visited dots
let drawPath = [];

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
  // background(255, 251, 189);

  // --------------------
  // ########## Check out this part ##########
  // --------------------
  // various tints that change how the images is seen

  // red
  // tint(255, 0, 0);

  // green
  // tint(0, 255, 0);

  // blue
  // tint(0, 0, 255);

  // make the background png darker, reveal each part stepwise?
  // background(0);
  // tint(255, 50);

  // --------------------
  // ########## End of test ###########
  // --------------------

  image(bgImg, 0, 0, width, height);

  // drawing the dots with normal (non-mirrored) coordinates
  drawDots();

  // un-mirroring the logic for the finger movement
  const finger = getMirroredFinger();

  if (finger) {
    // The following 7 lines of code were adapted with the help of ChatGPT
    // hit test that checks if a dot was connected
    if (currentDot < puzzleDotsPixels.length) {
      const target = puzzleDotsPixels[currentDot];
      const d = dist(finger.x, finger.y, target.x, target.y);
      if (d <= hitRadius) {
        // record progress - store the path in drawPath array
        drawPath.push({ x: target.x, y: target.y });
        // go to the next dot
        currentDot++;
      }
    }
  }

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

    // dot status
    const isVisited = i < currentDot;
    const isCurrent = i === currentDot;
    const isUpcoming = i > currentDot;

    // colors for statuses
    if (isVisited) {
      fill(255, 255, 255, 50);
    }

    if (isCurrent) {
      fill(255, 255, 255);
    }

    if (isUpcoming) {
      fill(255, 255, 255, 150);
    }

    ellipse(dot.x, dot.y, dotDiameter);

    // text numbers
    fill(0, 0, 0);
    text(i + 1, dot.x, dot.y);
  }
}

// The following 7 lines of code were adapted with the help of ChatGPT
// un-mirroring the fingertip coordinates by flipping x value back
function getMirroredFinger() {
  if (hands.length === 0) return null;
  // raw coordinates
  const indexFinger = hands[0].index_finger_tip;
  // flip x value, keep y value
  return { x: width - indexFinger.x, y: indexFinger.y };
}

function getHandsData(results) {
  hands = results;
}
