let video;

function setup() {
  createCanvas(1024, 768);
  // Use explicit constraints; some setups prefer this
  const constraints = {
    video: { facingMode: "user", width: 1024, height: 768 },
    audio: false,
  };
  video = createCapture(constraints, () => {
    // Make autoplay succeed on mobile/Safari
    video.elt.muted = true;
    video.elt.setAttribute("playsinline", "");
    video.elt.play();
  });
  video.size(1024, 768);
  video.hide();
}

function draw() {
  background(18);
  // Mirror for natural feel
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();
}
