window.onload = startGame;
// let timerLoop = null;
let loop;
let currentMap = [];
let numOfBox =0;
let numOfBoxOnSpot=0;

let currentLevel =1;
const CELL_SIZE = 40;
const NUM_MAPS =3;
const gameObjects = {
          player:{
            source: "gfx/player.png",
            sign: "@",
          },
          grass:{
            source: "gfx/grass.png",
            sign: "G",
          },
          block:{
            source: "gfx/block.png",
            sign: "D",
          },
          box:{
            source:"gfx/box.png",
            sign: "B",
          },
          spot:{
            source:"gfx/spot.png",
            sign: "*",
          },
          floor:{
            source:"gfx/floor.png",
            sign: "-",
          },
          "box on spot":{
            source:"gfx/bspot.png",
            sign: "$"
          },
          "player on spot":{
            source:"gfx/player.png",
            sign: "#"
          }
}
const fps = 30;


function startGame(){
  $.getJSON("list_maps/map"+`${currentLevel}`+".json", (jMap)=>{
    // console.log(jMap);
    const dataMap = jMap.layers[0].data;
    const height = jMap.layers[0].height;
    const width = jMap.layers[0].width;
    // console.log(dataMap);
    const tilesets = jMap.tilesets;
    let firstgidList ={};
    for(i =0; i <tilesets.length; i++){
      // console.log(tilesets[i].tileproperties)
      firstgidList[tilesets[i].firstgid] = tilesets[i].properties["0"].value;
    }
    // console.log(firstgidList)

    let map =[];
    for (i =0; i<height; i++){
      let row =[];
      for(j =0; j<width; j++){
          row.push(firstgidList[dataMap[j+ i*width]])
      }
      map.push(row);
    }
    currentMap =[...map];
    // console.log(currentMap)
    gameCanvas.createCanvas();
    // timerLoop =setInterval(gameLoop,1000/fps);
  });
}

let gameCanvas= {
  canvas: document.createElement('canvas'),
  createCanvas: function(){
    this.canvas.height = currentMap.length*CELL_SIZE;
    this.canvas.width = currentMap[0].length*CELL_SIZE;
    this.context = this.canvas.getContext("2d");

    this.drawComponent(currentMap);
    // document.body.appendChild(this.canvas);
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  },
  clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

  drawComponent:(map)=>{
    let currentBoxOnSpot= 0;
    let currentNumOfBox =0;

    for(i=0; i<map.length; i++){
      for(j=0; j<map[0].length; j++){
        if (map[i][j]===gameObjects.player.sign){
          player = new Component(gameObjects.player.source,j*CELL_SIZE,i*CELL_SIZE);
          gameObjects.player["posX"] = j;
          gameObjects.player["posY"] = i;
        }
        else if (map[i][j]=== gameObjects.grass.sign){
          grass= new Component(gameObjects.grass.source,j*CELL_SIZE,i*CELL_SIZE);
          gameObjects.grass["posX"] = j;
          gameObjects.grass["posY"] = i;
        }
        else if (map[i][j]=== gameObjects.block.sign){
          bock = new Component(gameObjects.block.source,j*CELL_SIZE,i*CELL_SIZE);
          gameObjects.block["posX"] = j;
          gameObjects.block["posY"] = i;
        }
        else if (map[i][j]=== gameObjects.box.sign || map[i][j]=== gameObjects["box on spot"].sign){
            if(map[i][j] === gameObjects.box.sign){
              box= new Component(gameObjects.box.source,j*CELL_SIZE,i*CELL_SIZE);
            }else{
              box= new Component(gameObjects["box on spot"].source,j*CELL_SIZE,i*CELL_SIZE);
              currentBoxOnSpot++;

            }
          gameObjects.box["posX"] = j;
          gameObjects.box["posY"] = i;
          currentNumOfBox++;

        }
        else if (map[i][j]=== gameObjects.spot.sign || map[i][j]=== gameObjects["player on spot"].sign){
          if(map[i][j] === gameObjects.spot.sign){
            spot = new Component(gameObjects.spot.source,j*CELL_SIZE,i*CELL_SIZE);
          }
          else {
            playerOnSpot = new Component(gameObjects.player.source,j*CELL_SIZE,i*CELL_SIZE);
            gameObjects.player["posX"] = j;
            gameObjects.player["posY"] = i;
          }
          gameObjects.spot["posX"] = j;
          gameObjects.spot["posY"] = i;

        }
        else if(map[i][j]=== gameObjects.floor.sign){
          floor = new Component(gameObjects.floor.source,j*CELL_SIZE,i*CELL_SIZE);
          gameObjects.floor["posX"] = j;
          gameObjects.floor["posY"] = i;
        }

      }
    }
    numOfBox = currentNumOfBox;
    numOfBoxOnSpot = currentBoxOnSpot;
  }

}

function Component(imgSource,x,y){
  this.x = x;
  this.y = y;
  this.img = new Image;
  this.img.src = imgSource;
  let ctx = gameCanvas.context;
  ctx.drawImage(this.img,this.x, this.y,CELL_SIZE,CELL_SIZE);
}


document.addEventListener('keydown',(e)=>{
  checkKeyPress(e);
});

function checkKeyPress(e){
  let currentPlayerPosX = gameObjects.player.posX;
  let currentPlayerPosY = gameObjects.player.posY;
  changePosition(e.keyCode, currentPlayerPosX,currentPlayerPosY)
}

function changePosition(keyCode, prevPosX, prevPosY){
  let dx = 0, dy = 0;
  if (keyCode ===37) dx = -1;   // moveLeft
  else if (keyCode === 38) dy =-1; //moveUp
  else if (keyCode === 39) dx = 1; //moveRight
  else if (keyCode === 40) dy = 1; //moveDown

  let nextPosX = prevPosX + dx;
  let nextPosY = prevPosY + dy;
  let currentPlayerPosSign = currentMap[prevPosY][prevPosX];
  let nextPlayerPosSign = currentMap[nextPosY][nextPosX];

  function changePrevPosPlayer(){
    //if player on spot, change this position after move -> spot
    if(currentPlayerPosSign === gameObjects["player on spot"].sign)
      currentMap[prevPosY][prevPosX] = gameObjects.spot.sign;
    else
      currentMap[prevPosY][prevPosX] = gameObjects.floor.sign;
  }

  //move to floor cell
  if(nextPlayerPosSign === gameObjects.floor.sign){
    currentMap[nextPosY][nextPosX] = gameObjects.player.sign;
    changePrevPosPlayer();
  }
  //move to spot cell
  else if(nextPlayerPosSign === gameObjects.spot.sign){
    currentMap[nextPosY][nextPosX] = gameObjects["player on spot"].sign;
    changePrevPosPlayer();
  }
  //move to box cell
  else if (nextPlayerPosSign === gameObjects.box.sign){
     let nextPosBoxSign = currentMap[nextPosY + dy][nextPosX + dx];
     let currentPosBoxSign = nextPlayerPosSign;
     // if next position of box is floor or spot-> pos of box = player,  pos of box + move = player
     if(nextPosBoxSign === gameObjects.floor.sign){
       currentMap[nextPosY+dy][nextPosX+dx] = gameObjects.box.sign;
       currentMap[nextPosY][nextPosX] = gameObjects.player.sign;
       changePrevPosPlayer();
     }
     else if(nextPosBoxSign === gameObjects.spot.sign){
       currentMap[nextPosY+dy][nextPosX+dx] =gameObjects["box on spot"].sign;
       currentMap[nextPosY][nextPosX] =gameObjects.player.sign;
       changePrevPosPlayer();
     }
   }
  //move to box on spot
  else if (nextPlayerPosSign === gameObjects["box on spot"].sign){
    let nextPosBoxSign = currentMap[nextPosY + dy][nextPosX + dx];
    let currentPosBoxSign = nextPlayerPosSign;

    // if next position of box is floor or spot-> pos of box = player,  pos of box + move = player
    if(nextPosBoxSign === gameObjects.floor.sign){
      currentMap[nextPosY+dy][nextPosX+dx] = gameObjects.box.sign;
      currentMap[nextPosY][nextPosX] = gameObjects["player on spot"].sign;
      changePrevPosPlayer();
    }
    else if(nextPosBoxSign === gameObjects.spot.sign){
      currentMap[nextPosY+dy][nextPosX+dx] =gameObjects["box on spot"].sign;
      currentMap[nextPosY][nextPosX] =gameObjects["player on spot"].sign;
      changePrevPosPlayer();
    }
  }

}

function gameLoop(){
  loop =requestAnimationFrame(gameLoop);
  if(numOfBoxOnSpot===numOfBox&& numOfBoxOnSpot!=0){
    if(currentLevel<NUM_MAPS){
      currentLevel++;
      numOfBoxOnSpot=0;
      numOfBox=0;

      // clearInterval(timerLoop)
      startGame();
    }
    else {
      alert("You Win!!!");
      cancelAnimationFrame(loop);
      // clearInterval(timerLoop)

    }
  }
  //wait after startGame load map => numOfBox != 0, if not currentMap may not load new map
  if(numOfBox!==0){
    gameCanvas.clear();
    gameCanvas.drawComponent(currentMap);

  }

}
requestAnimationFrame(gameLoop);
