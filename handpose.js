let handpose;
let video;
let hands = [];
let bgImg;

function preload() {
  handpose = ml5.handPose();
  bgImg = loadImage("img/placeholder-background.png");
}

function setup() {
  createCanvas(1024, 768);
  //   pixelDensity(1);
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

  // mirror for a natural feel
  push();
  translate(width, 0);
  scale(-1, 1);

  //   un-comment this to see the camera
  //   image(video, 0, 0, width, height);

  if (hands.length > 0) {
    let indexFinger = hands[0].index_finger_tip;
    push();
    fill(255);

    ellipse(indexFinger.x, indexFinger.y, 20);
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

function getHandsData(results) {
  hands = results;
}
