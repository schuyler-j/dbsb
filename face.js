const { createCanvas, loadImage, Image } = require('canvas');
const XMLSerializer = require('xmlserializer');
const {JSDOM } = require('jsdom');
const fs = require('fs');
const svgCode = `<svg id="face" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 200 200" >
	  <circle id="face-circle" cx="100" cy="100" r="80" fill="yellow" stroke="black" stroke-width="2" />
	  <circle id="face-path" d=""  />
    <circle id="left-eye" cx="75" cy="80" r="10" fill="black" />
    <circle id="right-eye" cx="125" cy="80" r="10" fill="black" />
    <path id="mouth" d="M70 130 Q100 160 130 130" fill="transparent" stroke="black" stroke-width="3" />
  </svg> `;

const dom = new JSDOM(svgCode);
const document = dom.window.document;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function manipulateFace() {

  var faceElement = document.getElementById('face');
  var gray = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generate a random hexadecimal color
  faceElement.style.backgroundColor = gray;

  // Randomly move the eyes
  var leftEye = document.getElementById('left-eye');
  var rightEye = document.getElementById('right-eye');
  leftEye.setAttribute('cx', getRandomInt(70, 80));
  rightEye.setAttribute('cx', getRandomInt(120, 130));
  leftEye.setAttribute('cy', getRandomInt(70, 90));
  rightEye.setAttribute('cy', getRandomInt(70, 90));
  var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generate a random hexadecimal color
  leftEye.setAttribute('fill', randomColor);
  var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generate a random hexadecimal color
  rightEye.setAttribute('fill', randomColor);
  var eyeSize = getRandomInt(10, 25);
  leftEye.setAttribute('r', eyeSize);
  rightEye.setAttribute('r', eyeSize);

  // Randomly change the color of the mouth
  var mouth = document.getElementById('mouth');
  var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generate a random hexadecimal color
  mouth.setAttribute('stroke', randomColor);
  var size = getRandomInt(2, 20);
  mouth.setAttribute('stroke-width', size);

  // Randomly warp the face circle
  var faceCircle = document.getElementById('face-circle');
  var rx = getRandomInt(60, 200);
  var ry = getRandomInt(10, 250);
  var rr = getRandomInt(130, 180);
  var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generate a random hexadecimal color
  faceCircle.setAttribute('cx', rx);
  faceCircle.setAttribute('cy', ry);
  faceCircle.setAttribute('fill', randomColor);
  faceCircle.setAttribute('r', rr);

  var randomX1 = getRandomInt(60, 80);
  var randomY1 = getRandomInt(120, 140);
  var randomX2 = getRandomInt(100, 120);
  var randomY2 = getRandomInt(140, 160);
  var mouthPath = "M" + randomX1 + " " + randomY1 + " Q100 " + randomY2 + " " + randomX2 + " " + randomY1;
  mouth.setAttribute('d', mouthPath);
}

function convertSVGtoPNG(svgElement, width, height, callback) {
  // Create a new canvas element using 'node-canvas'
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // Get the SVG content as XML
  const svgXml = XMLSerializer.serializeToString(svgElement);

  // Create a new Image object using 'node-canvas'
  const image = new Image();

  image.onload = function () {
    // Draw the SVG onto the canvas
    context.drawImage(image, 0, 0);

    // Get the PNG data URL from the canvas
    const pngDataUrl = canvas.toDataURL('image/png');

    // Invoke the callback with the PNG data URL
    callback(pngDataUrl);
  };

  // Set the Image source as the SVG data
  image.src = 'data:image/svg+xml;base64,' + Buffer.from(svgXml).toString('base64');
}

const svgElement = document.getElementById('face');
const width = 120;
const height = 120;

for (var i = 0; i < 5; i++){
manipulateFace();
convertSVGtoPNG(svgElement, width, height, function (pngDataUrl) {
  console.log(pngDataUrl);
	fs.appendFile('data/data.txt', "\n\n"+pngDataUrl+"\n\n", (err) => {
		if (err) {
			console.error('no write', err);
		} else {
			console.log('URL saved');
		}
	});
});
}
