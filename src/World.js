// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =  `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

//Fragment shader program
var FSHADER_SOURCE =  `
  precision mediump float; 
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  varying vec4 v_VertPos; 
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == 0) {
      gl_FragColor = u_FragColor;                   // Use color
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);          // Use UV debug color
    }
    else if (u_whichTexture == -2){
      gl_FragColor = texture2D(u_Sampler0, v_UV);   // Use texture0
    }
    else if (u_whichTexture == -3) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if (u_whichTexture == -4) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if (u_whichTexture == -5){
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    }
    else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);          // Error, put Redish debugging color
    }
    vec3 lightVector = vec3(v_VertPos)-u_lightPos;
    float r=length(lightVector);
    //if (r<0.0) {
    //  gl_FragColor = vec4(1,0,0,1);
    //}
   // else if (r<0.0) {
    //  gl_FragColor= vec4(0,1,0,1);
    //}
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);
    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDot = max(dot(N,L), 0.0);

    //Reflection
    vec3 R = reflect(L,N);

    //eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    //Specular
    float specular = pow(max(dot(E,R), 0.0),10.0);

    vec3 diffuse = vec3(gl_FragColor) * nDot * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    if (u_lightOn){
      gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
    } else {
      gl_FragColor = vec4(diffuse+ambient, 1.0);
    }
  }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_lightPos;
let u_lightOn;
let u_cameraPos;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl",{ preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0){
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  //Get the storge location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return false;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
      console.log('Failed to get the storage location of u_lightOn');
      return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return false;
  }


  //Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Globals related UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=180;
let g_lf1Angle=0;
let g_rf1Angle=0;
let g_lb1Angle=0;
let g_rb1Angle=0;
let g_lb2Angle=0;
let g_rb2Angle=0;
let g_lb3Angle=0;
let g_rb3Angle=0;
let g_lf1Animation=false;
let g_rf1Animation=false;
let g_lb1Animation=false;
let g_rb1Animation=false;
let g_lb3Animation=false;
let g_rb3Animation=false;
let x1 = 0;
let y1 = 0;
let g_normalOn=false;
let g_lightPos=[0,1,-2];
let g_lightOn=true;

//Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  document.getElementById('animationlf1OffButton').onclick = function() {g_lf1Animation=false;};
  document.getElementById('animationlf1OnButton').onclick = function() {g_lf1Animation=true;};
  
  document.getElementById('animationrf1OffButton').onclick = function() {g_rf1Animation=false;};
  document.getElementById('animationrf1OnButton').onclick = function() {g_rf1Animation=true;};

  document.getElementById('animationlb1OffButton').onclick = function() {g_lb1Animation=false;};
  document.getElementById('animationlb1OnButton').onclick = function() {g_lb1Animation=true;};
  
  document.getElementById('animationrb1OffButton').onclick = function() {g_rb1Animation=false;};
  document.getElementById('animationrb1OnButton').onclick = function() {g_rb1Animation=true;};

  document.getElementById('animationlb3OffButton').onclick = function() {g_lb3Animation=false;};
  document.getElementById('animationlb3OnButton').onclick = function() {g_lb3Animation=true;};
  
  document.getElementById('animationrb3OffButton').onclick = function() {g_rb3Animation=false;};
  document.getElementById('animationrb3OnButton').onclick = function() {g_rb3Animation=true;};
 
  document.getElementById('lf1Slide').addEventListener('mousemove', function() { g_lf1Angle = this.value; renderAllShapes();});
  document.getElementById('rf1Slide').addEventListener('mousemove', function() { g_rf1Angle = this.value; renderAllShapes();});
  document.getElementById('lb1Slide').addEventListener('mousemove', function() { g_lb1Angle = this.value; renderAllShapes();});
  document.getElementById('rb1Slide').addEventListener('mousemove', function() { g_rb1Angle = this.value; renderAllShapes();});
  document.getElementById('lb3Slide').addEventListener('mousemove', function() { g_lb3Angle = this.value; renderAllShapes();});
  document.getElementById('rb3Slide').addEventListener('mousemove', function() { g_rb3Angle = this.value; renderAllShapes();});
  //Size Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes();});
  //Segment Slider Events
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value;});
  document.getElementById('normalOn').onclick = function() {g_normalOn=true};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false};
  document.getElementById('lightSlideX').addEventListener('mousemove', function (ev) { if(ev.buttons==1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function (ev) { if(ev.buttons==1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function (ev) { if(ev.buttons==1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
  document.getElementById('lightOn').onclick = function() {g_lightOn=true};
  document.getElementById('lightOff').onclick = function() {g_lightOn=false};
} 


function initTextures() {

  // Get the storage location of u_Sampler
  //var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  //if (!u_Sampler0) {
  //  console.log('Failed to get the storage location of u_Sampler0');
  //  return false;
  //}
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendTextureToGLSL(image); };
  // Tell the browser to load an image
  image.src = 'gound1.jpg';

  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendTextureToGLSL1(image1); };
  // Tell the browser to load an image
  image1.src = 'skin1.jpg';

  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendTextureToGLSL2(image2); };
  // Tell the browser to load an image
  image2.src = 'wall.jpg';

  return true;
}

function sendTextureToGLSL(image) {
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
} 

function sendTextureToGLSL1(image) {
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
} 

function sendTextureToGLSL2(image) {
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
} 


function main() {
  //Set up Canvas and gl variables
  setupWebGL();
  //Set up GLSL shader programs and connect GLSL variavles
  connectVariablesToGLSL();

  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press

  initTextures();
  canvas.onmousedown = function(ev) { [g_prev_x, g_prev_y] = converCoordinatesEventsToGL(ev); move = true };
  canvas.onmouseup = function(ev) { move = false }
  document.onkeydown = keydown;
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  cameraMove(canvas, currentAngle);
  // Clear <canvas>
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = []; //The array to store the size of a point

let g_prev_x = 0;
let g_prev_y = 0;
let move = false;
let currentAngle=[0.0,0.0];

function cameraMove(canvas, currentAngle) {
  canvas.addEventListener('mousemove', function(ev) {
      if (move) {
        let deltaX = ev.clientX - g_prev_x;
        let deltaY = ev.clientY - g_prev_y;
        
        let factor = 0.4;
        currentAngle[0] += factor * deltaY;
        currentAngle[1] += factor * deltaX;
        currentAngle[0] = Math.max(-90, Math.min(90, currentAngle[0]));
        let rotationMatrix = new Matrix4()
            .rotate(currentAngle[0], 1, 0, 0)
            .rotate(currentAngle[1], 0, 1, 0);
        gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotationMatrix.elements);
        renderAllShapes(); 

        g_prev_x = ev.clientX;
        g_prev_y = ev.clientY;
    }
  });
}
function converCoordinatesEventsToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);
}


var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

//Called by brower repeatedly whenever its time
function tick(){
  //save the current time
  g_seconds=performance.now()/1000.0-g_startTime;

  //print some debug information so we know we are running
  //console.log(g_seconds);
  updateAnimationangles();
  //Draw everything
  renderAllShapes();

  //Tell the browswer to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationangles(){
  if(g_lf1Animation){
    g_lf1Angle = 6*Math.sin(g_seconds);
  }
  if(g_rf1Animation){
    g_rf1Angle= 6*Math.sin(g_seconds);
  }
  if(g_lb1Animation){
    g_lb1Angle = 3*Math.sin(g_seconds);
  }
  if(g_rb1Animation){
    g_rb1Angle= 3*Math.sin(g_seconds);
  }
  if(g_lb3Animation){
    g_lb3Angle = 1.3*Math.sin(g_seconds);
  }
  if(g_rb3Animation){
    g_rb3Angle= 1.3*Math.sin(g_seconds);
  }
  g_lightPos[0]=Math.cos(g_seconds);
}

let camera = new Camera();

function keydown(ev) {
  if (ev.keyCode==87 ) {
    camera.moveForward();
  } else if (ev.keyCode==83) {
    camera.moveBackward();
  } else if (ev.keyCode==65) {
    camera.moveLeft();
  } else if (ev.keyCode==68) {
    camera.moveRight();
  }  else if (ev.keyCode==81) {
    camera.rotatLeft();
  } else if (ev.keyCode==69) {
    camera.rotatRight();
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

var grey = [215/255,215/255,215/255,1];
var white = [1,1,1,1];
var blue = [135/255, 206/255, 235/255, 1.0];
//var g_eye = [0,0,3];
//var g_at = [0,0,100];
//var g_up = [0,1,0];

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

function drawMap() {
  var wall = new Cube();
  for (x = 0; x < g_map.length; x++) {
    for (y = 0; y < g_map[x].length; y++) {
      if (g_map[x][y] == 1) {
        wall.matrix.setTranslate(x - 4, -0.5, y - 4);
        wall.textureNum = -4;
        wall.render();
      }
    }
  }
}


function renderAllShapes(){
  //check the time at the start of this function
  var startTime = performance.now();
  //Pass the projection matrix
  var projMat=new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  

  //calculat the rotation matrix
  var rotationMatrix = new Matrix4()
        .rotate(currentAngle[0], 1, 0, 0)
        .rotate(currentAngle[1], 0, 1, 0);
  
  // Set view of view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2], 
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2], 
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]
  ).multiply(rotationMatrix);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  //pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);

  //clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Draw a test triangle
  //drawTriangle3D([-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]);

  drawMap();
  //Draw a sky
  var skybox = new Cube();
  skybox.color = blue;
  if (g_normalOn) skybox.textureNum=-5;
  skybox.matrix.scale(32, 100,32);
  skybox.matrix.translate(-0.3, -0.008, 0.3);
  skybox.render();
  
  // Ground
  var ground = new Cube();
  ground.color = [1.0, 1.0, 1.0, 1.0];
  ground.textureNum = -2;
  //ground.matrix.translate(0, 0, 0);
  //ground.matrix.scale(80,80, 80);
  ground.matrix.translate(-4, -0.39, 3);
  ground.matrix.scale(8,-.25, 8);
  //ground.matrix.rotate(180,1,0,0);
  ground.render();

  //Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform1i(u_lightOn,g_lightOn);
  //Draw the light
  var light =new Cube();
  light.color=[2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(.1,.1,.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  // Draw Sphere
  var sp = new Sphere();
  if (g_normalOn) sp.textureNum=-5;
  sp.matrix.translate(0,0,1.5);
  sp.render();

  //Draw a body cube
  var body = new Cylinder();
  body.color = white;
  body.textureNum = -3;
  body.matrix.translate(0, .25, 0.1);
  var bodyMat1 = new Matrix4(body.matrix);
  var bodyMat2 = new Matrix4(body.matrix);
  var bodyMat3 = new Matrix4(body.matrix);
  var bodyMat4 = new Matrix4(body.matrix);
  var bodyMat5 = new Matrix4(body.matrix);
  var bodyMat6 = new Matrix4(body.matrix);
  var bodyMat7 = new Matrix4(body.matrix);
  body.matrix.rotate(45,1,0,0);
  body.matrix.scale(0.27, .27, .3);
  body.render();
  
  //Draw a leftfroelimb
  var leftfroelimb1 = new Cube();
  leftfroelimb1.color = grey;
  leftfroelimb1.matrix = bodyMat1;
  leftfroelimb1.matrix.translate(-.2, -.07, 0.1);
  leftfroelimb1.matrix.rotate(-g_lf1Angle,1,0,0);
  leftfroelimb1.matrix.scale(.1,.1,.3);
  leftfroelimb1.render();

  //Draw a rightfroelimb
  var rightfroelimb1 = new Cube();
  rightfroelimb1.color = grey;
  rightfroelimb1.matrix = bodyMat2;
  rightfroelimb1.matrix.translate(.1, -.07, 0.1);
  rightfroelimb1.matrix.rotate(-g_rf1Angle,1,0,0);
  rightfroelimb1.matrix.scale(.1,.1,.3);
  rightfroelimb1.render();

  //Draw a leftbacklimb1
  var leftbacklimb1 = new Cube();
  leftbacklimb1.color = grey;
  leftbacklimb1.matrix = bodyMat3;
  leftbacklimb1.matrix.translate(-.2, -.40, .35);
  leftbacklimb1.matrix.rotate(-g_lb1Angle,1,0,0);
  var leftbacklimb1mat = new Matrix4(leftbacklimb1.matrix);
  leftbacklimb1.matrix.scale(.1,.1,.3);
  leftbacklimb1.render();

  //Draw a rightbacklim1
  var rightbacklim1 = new Cube();
  rightbacklim1.color = grey;
  rightbacklim1.matrix = bodyMat4;
  rightbacklim1.matrix.translate(.1, -.40, .35);
  rightbacklim1.matrix.rotate(-g_rb1Angle,1,0,0);
  var rightbacklim1mat = new Matrix4(rightbacklim1.matrix);
  rightbacklim1.matrix.scale(.1,.1,.3);
  rightbacklim1.render();

  //Draw a leftbacklim2
  var leftbacklimb2 = new Cube();
  leftbacklimb2.color = grey;
  leftbacklimb2.matrix = leftbacklimb1mat;
  leftbacklimb2.matrix.translate(0, -.20, -.13);
  leftbacklimb2.matrix.rotate(45, 1, 0,0);
  var leftbacklimb2mat = new Matrix4(leftbacklimb2.matrix);
  leftbacklimb2.matrix.scale(.1,.1,.3);
  leftbacklimb2.render();

  //Draw a rightbacklim2
  var rightbacklim2 = new Cube();
  rightbacklim2.color = grey;
  rightbacklim2.matrix = rightbacklim1mat;
  rightbacklim2.matrix.translate(.0, -.20, -.13);
  rightbacklim2.matrix.rotate(45, 1, 0,0);
  var rightbacklim1mat2 = new Matrix4(rightbacklim2.matrix);
  rightbacklim2.matrix.scale(.1,.1,.3);
  rightbacklim2.render();

  //Draw a leftbacklim3
  var leftbacklim3 = new Cube();
  leftbacklim3.color = grey;
  leftbacklim3.matrix = leftbacklimb2mat;
  leftbacklim3.matrix.rotate(-45,1,0,0);
  leftbacklim3.matrix.rotate(-g_lb3Angle,1,0,0);
  leftbacklim3.matrix.translate(0, -.03, .0);
  leftbacklim3.matrix.scale(.1,.1,.3);
  leftbacklim3.render();

  //Draw a rightbacklim3
  var rightbacklim3 = new Cube();
  rightbacklim3.color = grey;
  rightbacklim3.matrix = rightbacklim1mat2;
  rightbacklim3.matrix.rotate(-45,1,0,0);
  rightbacklim3.matrix.rotate(-g_rb3Angle,1,0,0);
  rightbacklim3.matrix.translate(0, -.03, .0);
  rightbacklim3.matrix.scale(.1,.1,.3);
  rightbacklim3.render();

  //Draw a head
  var head = new Cube();
  head.color = white;
  head.matrix = bodyMat5;
  head.matrix.translate(-.15,0,0);
  var headmat1 = new Matrix4(head.matrix);
  var headmat2 = new Matrix4(head.matrix);
  head.matrix.scale(.3,.3,.3);
  head.render();

  //Draw a ear
  var ear1 = new Cube();
  ear1.color = grey;
  ear1.matrix = headmat1;
  ear1.matrix.translate(0,.3,-.1);
  ear1.matrix.scale(.1,.3,.1);
  ear1.render();

  var ear2 = new Cube();
  ear2.color = grey;
  ear2.matrix = headmat2;
  ear2.matrix.translate(.2,.3,-.1);
  ear2.matrix.scale(.1,.3,.1);
  ear2.render();

  //Draw a eyes
  var eyes1 = new Cube();
  eyes1.color = [255/255, 125/255, 0/255, 1];
  eyes1.matrix = bodyMat6;
  eyes1.matrix.translate(.07,.14,-.27);
  eyes1.matrix.scale(.08,.08,.08);
  eyes1.render();

  var eyes2 = new Cube();
  eyes2.color = [255/255, 125/255, 0/255, 1];
  eyes2.matrix = bodyMat7;
  eyes2.matrix.translate(-.15,.14,-.27);
  eyes2.matrix.scale(.08,.08,.08);
  eyes2.render();
  

  //Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10,"numdot");
}

//Set the text of a HTML element
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


