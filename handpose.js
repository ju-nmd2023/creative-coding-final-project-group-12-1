let handpose;
let video;
let hands = [];

// ### face ###
// array for the positions of normalized coordianates
const puzzleDotsFace = [
  { x: 0.452, y: 0.031 }, // 1
  { x: 0.413, y: 0.557 }, // 2
  { x: 0.451, y: 0.557 }, // 3
  { x: 0.454, y: 0.609 }, // 4
  { x: 0.435, y: 0.796 }, // 5
  { x: 0.336, y: 0.703 }, // 6
  { x: 0.272, y: 0.54 }, // 7
  { x: 0.248, y: 0.436 }, // 8
  { x: 0.258, y: 0.257 }, // 9
  { x: 0.438, y: 0.042 }, // 10
];

// ### lips ###
// array for the positions of normalized coordianates
const puzzleDotsLips = [
  { x: 0.396, y: 0.628 }, // 1
  { x: 0.437, y: 0.599 }, // 2
  { x: 0.458, y: 0.608 }, // 3
  { x: 0.488, y: 0.59 }, // 4
  { x: 0.538, y: 0.638 }, // 5
  { x: 0.494, y: 0.694 }, // 6
  { x: 0.438, y: 0.689 }, // 7
  { x: 0.396, y: 0.643 }, // 8
];

// ### eye ###
// array for the positions of normalized coordianates
const puzzleDotsEye = [
  { x: 0.426, y: 0.449 }, // 1
  { x: 0.361, y: 0.471 }, // 2
  { x: 0.34, y: 0.471 }, // 3
  { x: 0.255, y: 0.439 }, // 4
  { x: 0.328, y: 0.421 }, // 5
  { x: 0.36, y: 0.415 }, // 6
  { x: 0.417, y: 0.439 }, // 7
];

// // ### second eye ###
// // array for the positions of normalized coordianates
const puzzleDotsSecondEye = [
  { x: 0.464, y: 0.359 }, // 1
  { x: 0.545, y: 0.32 }, // 2
  { x: 0.581, y: 0.326 }, // 3
  { x: 0.673, y: 0.35 }, // 4
  { x: 0.571, y: 0.391 }, // 5
  { x: 0.543, y: 0.393 }, // 6
  { x: 0.475, y: 0.365 }, // 7
];

// ### stages and background
let stageImages = [];

let bgImg;

// an array containing all of the stages
const stages = [
  { name: "face", dots: puzzleDotsFace, bgIndex: 0 },
  { name: "lips", dots: puzzleDotsLips, bgIndex: 1 },
  { name: "eye", dots: puzzleDotsEye, bgIndex: 2 },
  { name: "secondEye", dots: puzzleDotsSecondEye, bgIndex: 3 },
  { name: "final", dots: [], bgIndex: 4 },
];

let currentStageIndex = 0;

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

// these are used for eliminating the camera jittering problem
// stores the previous smoothed point
let smoothFingerPt;
// controls how much of the new value is accepted each frame
// New value = Old value + SMOOTHING × (Raw − Old)
// 0..1 (higher = snappier, lower = smoother)
const SMOOTHING = 0.25;

// sound
let synth;
const notes = ["C4", "D4", "E4", "G4", "A4", "B3", "F4"];

function preload() {
  handpose = ml5.handPose();

  // pre-load all of the backgrounds
  stageImages = [
    loadImage("img/woman_01.png"),
    loadImage("img/woman_02.png"),
    loadImage("img/woman_03.png"),
    loadImage("img/woman_04.png"),
    loadImage("img/woman_05.png"),
  ];
}

function setup() {
  createCanvas(1024, 768);

  synth = new Tone.Synth().toDestination();

  calculateDotPixels();
  // check the calculation pixel calculation
  // console.log("puzzleDotsPixels:", puzzleDotsPixels);

  video = createCapture(VIDEO);
  video.size(1024, 768);
  video.hide();

  handpose.detectStart(video, getHandsData);

  // starting stage setup
  setStage(0);
}

// --------------------
// The mlp5 camera gives a slightly different fingertip position with every frame.
// This makes the ellipse wiggle, especially when the hit test occurs, close to the dot.
// The function below comes from ChatGPT and it adds an averager.
// This allows to blend the new position with the previous one, so sudden tiny hops get softened.
// Without this, the puzzle was doable, but with this this, the experience is much better.
// We weren't able to come up with a solution for the jittering on our own, so we used ChatGPT's solution
// --------------------

// The following 12 lines of code were adapted with the help of ChatGPT
function smoothFinger(raw) {
  if (!raw) return null;
  if (!smoothFingerPt) {
    // first frame: just take the raw value
    smoothFingerPt = { x: raw.x, y: raw.y };
  } else {
    // exponential moving average (lerp)
    smoothFingerPt.x += (raw.x - smoothFingerPt.x) * SMOOTHING;
    smoothFingerPt.y += (raw.y - smoothFingerPt.y) * SMOOTHING;
  }
  return smoothFingerPt;
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

  // drawing lines between visited dots
  drawVisitedPath();

  // drawing the dots with normal (non-mirrored) coordinates
  drawDots();

  // un-mirroring the logic for the finger movement
  const finger = getMirroredFinger();

  if (finger) {
    // The following 14 lines of code (excluding the ones connected to the sound) were adapted with the help of ChatGPT
    // hit test that checks if a dot was connected
    if (currentDot < puzzleDotsPixels.length) {
      const target = puzzleDotsPixels[currentDot];
      const d = dist(finger.x, finger.y, target.x, target.y);
      if (d <= hitRadius) {
        // record progress - store the path in drawPath array
        drawPath.push({ x: target.x, y: target.y });

        // play a hit tone
        playDotHit(currentDot);

        // go to the next dot
        currentDot++;
        // if finished this stage, advance to next
        if (currentDot >= puzzleDotsPixels.length) {
          advanceStage();
        }
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
    // old logic, before implementing the smoothing function
    // let indexFinger = hands[0].index_finger_tip;

    // raw fingertip from ml5
    const raw = hands[0].index_finger_tip;
    // smoothed fingertip
    const smoothed = smoothFinger(raw);

    push();
    fill(255, 255, 255);

    ellipse(smoothed.x, smoothed.y, 10);
    pop();
  }
  pop();
}

// The following 22 lines of code were adapted with the help of ChatGPT
function setStage(stageIndex) {
  currentStageIndex = stageIndex;

  bgImg = stageImages[stages[currentStageIndex].bgIndex];

  // console.log("Stage: ", stages[currentStageIndex].name, " Dots: ", stages[currentStageIndex].dots.length, " bgIndex: ", stages[currentStageIndex].bgIndex);

  // reset drawing progress for each stage
  drawPath = [];
  currentDot = 0;

  // convert pixel coordinates into normalized dot coordinates
  calculateDotPixels();
}

// switching stages to progress the puzzle
function advanceStage() {
  // advance to the next when finished with the current stage
  if (currentStageIndex < stages.length - 1) {
    setStage(currentStageIndex + 1);
  }
}

// console.log the normalized coordinates values (rounded to 3 decimals)
// function mousePressed() {
//   const xn = +(mouseX / width).toFixed(3);
//   const yn = +(mouseY / height).toFixed(3);
//   console.log(`{ x: ${xn}, y: ${yn} },`);
// }

// The following 8 lines of code were adapted with the help of ChatGPT
function calculateDotPixels() {
  puzzleDotsPixels = [];
  const dots = stages[currentStageIndex].dots;
  // fills the new array with pixel coordinates
  for (let i = 0; i < dots.length; i++) {
    const p = dots[i];
    puzzleDotsPixels.push({ x: p.x * width, y: p.y * height });
  }
}

// lines between two connected dots
function drawVisitedPath() {
  // at least 2 points needed
  if (drawPath.length < 2) {
    return;
  }
  noFill();
  stroke(255, 255, 255, 150);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < drawPath.length; i++) {
    vertex(drawPath[i].x, drawPath[i].y);
  }
  endShape();
}

function drawDots() {
  noStroke();
  fill(255, 255, 255);
  textAlign(CENTER, CENTER);
  textSize(10);

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

// move to the next stage with the "N"-key - only for testing
function keyPressed() {
  if (key === "N") advanceStage();
}

// play a note once a dot is hit
function playDotHit() {
  const randomNote = random(notes);
  synth.triggerAttackRelease(randomNote, "8n");
}

// unlock audio context on first user interaction
function mousePressed() {
  Tone.start();
}

function touchStarted() {
  Tone.start();
}
