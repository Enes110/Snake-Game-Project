// Global declaration
const topPosition = 0.05;
const snakeForwardingSpeed = 250;
const rowColumn = 10;
const fieldSize = 1;
const foodSize = .04;

const gridMin = 0;
const gridMax = rowColumn * rowColumn -1;
const snakeCellSize = fieldSize/rowColumn;

let gridPositionsArray = [];
let leftShifter = 0;
let topShifter = 0;
let interval = null;
let snakeFood = null;
let foodPosition = null;

let snakeGame = null;
let snakePosition = null;
let snakePositionShifter = 0;
let snakeCurrentMovementDir = null;


const randomInteger = (max , min) => {
  return Math.floor(Math.random() * (max - min) ) + min;
}

fillGridXYPositions = ()=> {
  let positions = [];
  let i = 0;

  for(let row = -45; row <= 45; row += rowColumn ){
    for(let col = 45; col >= -45; col -= rowColumn ){
      positions[i] = {
        x: row,
        y: col,
      }
      i++;
    }
  }
  return positions;
}

randomFoodPosition = () => {
  foodPosition = randomInteger(gridMax, gridMin);
  snakeFood.position.x = gridPositions[foodPosition].x/100;
  snakeFood.position.y = gridPositions[foodPosition].y/100;
  snakeFood.position.z = topPosition;
}

gridPositions = fillGridXYPositions();

/**
 * Initialize webGL
 */
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setClearColor('rgb(255,255,255)');

const scene = new THREE.Scene();
// Set camera
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0,-7,18);
scene.add(camera);
camera.zoom = 7;
camera.lookAt(scene.position);
camera.updateProjectionMatrix()

// Create fields
const fieldGeo = new THREE.PlaneGeometry( 1, 1 );
const fieldMat = new THREE.MeshBasicMaterial( {color: 0xBFBFBF, side: THREE.DoubleSide} );
const field = new THREE.Mesh( fieldGeo, fieldMat );

// Create grid in scene based on the fields dimension
const gridHelper = new THREE.GridHelper( fieldSize, rowColumn );
gridHelper.rotation.x =  Math.PI / 2;
gridHelper.position.z = .001;
field.add(gridHelper);
scene.add(field);


// Add snakeGame randomly on the grid
const snakeGeo = new THREE.BoxGeometry(snakeCellSize,snakeCellSize,snakeCellSize);
const snakeMat = new THREE.MeshBasicMaterial({color: 'green'});
const snakeCell = new THREE.Mesh(snakeGeo, snakeMat);

snakePosition = randomInteger(gridMax , gridMin);
const snakeRandPosition = gridPositions[snakePosition];
snakeCell.position.set( snakeRandPosition.x / 100, snakeRandPosition.y / 100, topPosition);
snakeCell.scale.set(1.015,1.015,1.015)
field.add(snakeCell);
snakeGame = new Deque();
snakeGame.insertFront(snakeCell)

const foodGeo= new THREE.SphereGeometry( 1, 28,28);
const foodMat = new THREE.MeshBasicMaterial( {color: 'red', side: THREE.DoubleSide} );
snakeFood = new THREE.Mesh( foodGeo, foodMat );
snakeFood.scale.set(foodSize, foodSize, foodSize);

// put food at random position
randomFoodPosition();
field.add(snakeFood)


const createTailForSnake = () => {
  const newMaterial = new THREE.MeshBasicMaterial({color: "blue"})
  const newCell = new THREE.Mesh(snakeGeo, newMaterial);

  newCell.position.z = topPosition - 0.00002;
  newCell.material = new THREE.MeshBasicMaterial({color:"blue"})
  newCell.position.x += (leftShifter/100);
  newCell.position.y += (topShifter/100);
  field.add(newCell)
  snakeGame.insertBack(newCell)
}

const move = () => {
  let tmp = null;
  let snakeCell = snakeGame.getFront();
  let previousCell = snakeCell.clone();
  snakeCell.position.x += (leftShifter/100);
  snakeCell.position.y += (topShifter/100);

  for(let i=0; i < snakeGame.size() - 1; i++){
    snakeCell = snakeGame.getByIndex(i + 1);
    tmp = snakeCell.clone();
    snakeCell.position.x = previousCell.position.x;
    snakeCell.position.y = previousCell.position.y;
    previousCell = tmp;
  }
}

// Game control
window.onkeyup = (e) =>{
  e.preventDefault();

  if(snakeCurrentMovementDir == null){
    init();
  }

  switch(e.code){
    case 'ArrowUp':
      if(snakeCurrentMovementDir === "ArrowDown"){
        console.log("You cannot move down!");
        return ;
      }
      leftShifter = 0;
      topShifter = rowColumn;
      snakePositionShifter = -fieldSize;
      break;
    case 'ArrowLeft':
      if(snakeCurrentMovementDir === "ArrowRight") {
        console.log("You cannot move right!");
        return ;
      }
      leftShifter = -rowColumn;
      topShifter = 0;
      snakePositionShifter =-rowColumn;
      break;
    case 'ArrowRight':
      if(snakeCurrentMovementDir === "ArrowLeft") {
        console.log("You cannot move left!")
        return ;
      }
      leftShifter = rowColumn;
      topShifter = 0;
      snakePositionShifter = rowColumn;
      break;
    case 'ArrowDown':
      if(snakeCurrentMovementDir === "ArrowUp") {
        console.log("You cannot move up!")
        return ;
      }
      leftShifter = 0;
      topShifter = -rowColumn;
      snakePositionShifter = fieldSize;
      break;
  }
  snakeCurrentMovementDir = e.code;

}


// interval setting
function init(){
  interval = setInterval(()=>{
    // final position holder for snakeGame
    snakePosition += snakePositionShifter;
    // If snakeGame hits food, create a new tail and set food at random position
    if(snakePosition === foodPosition){
      createTailForSnake();
      randomFoodPosition();
    }
    // Keep moving to next cell depending on the direction at an interval of snakeForwardingSpeed
    move();
  }, snakeForwardingSpeed)
}


const controls = new THREE.TrackballControls(camera, renderer.domElement);

/**
 * Render loop
 * @param ms
 */
function render(ms) {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  controls.update();
}
render();

function Deque() {
  //To track the elements from back
  let count = 0;

  //To track the elements from the front
  let lowestCount = 0;

  //To store the data
  let items = {};

  //Add an item on the front
  this.insertFront = (elm) => {

    if(this.isEmpty()){
      //If empty then add on the back
      this.insertBack(elm);

    }else if(lowestCount > 0){
      //Else if there is item on the back
      //then add to its front
      items[--lowestCount] = elm;

    }else{
      //Else shift the existing items
      //and add the new to the front
      for(let i = count; i > 0; i--){
        items[i] = items[i - 1];
      }

      count++;
      items[0] = elm;
    }
  }

  //Add an item on the back of the list
  this.insertBack = (elm) => {
    items[count++] = elm;
  }

  //Remove the item from the front
  this.removeFront = () => {
    //if empty return null
    if(this.isEmpty()){
      return null;
    }

    //Get the first item and return it
    const result = items[lowestCount];
    delete items[lowestCount];
    lowestCount++;
    return result;
  }

  //Remove the item from the back
  this.removeBack = () => {
    //if empty return null
    if(this.isEmpty()){
      return null;
    }

    //Get the last item and return it
    count--;
    const result = items[count];
    delete items[count];
    return result;
  }

  //Peek the first element
  this.getFront = () => {
    //If empty then return null
    if(this.isEmpty()){
      return null;
    }

    //Return first element
    return items[lowestCount];
  }

  this.getByIndex = (index) => {
    if(this.isEmpty()){
      return null;
    }
    return items[index];
  };

  //Peek the last element
  this.getBack = () => {
    //If empty then return null
    if(this.isEmpty()){
      return null;
    }

    //Return first element
    return items[count - 1];
  }

  //Check if empty
  this.isEmpty = () => {
    return this.size() === 0;
  }

  //Get the size
  this.size = () => {
    return count - lowestCount;
  }

  //Clear the deque
  this.clear = () => {
    count = 0;
    lowestCount = 0;
    items = {};
  }

  //Convert to the string
  //From front to back
  this.toString = () => {
    if (this.isEmpty()) {
      return '';
    }
    let objString = `${items[lowestCount]}`;
    for (let i = lowestCount + 1; i < count; i++) {
      objString = `${objString},${items[i]}`;
    }
    return objString;
  }
}
