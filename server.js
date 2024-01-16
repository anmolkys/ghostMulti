const express =  require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
const path = require('path');

const DEBUG = false;


function randomColor() {
    return [Math.random(), Math.random(), Math.random()];
}

// Player
class Player {
    constructor(id) {
      this.id = id;
      this.x = 300;
      this.y = 270;
      this.color = randomColor();
      this.speed = 3;
    }

    moveRight() {
        this.x += this.speed;
    }
    moveLeft() {
        this.x -= this.speed;
    }
    moveUp(){
        this.y-= this.speed;
    }
    moveDown(){
        this.y+=this.speed;
    }
}


const PLAYERS = {};
let index = 0;
io.on("connection",(socket)=>{
    let id = ++index;
    let player = new Player(id);
    PLAYERS[id]=player;


    socket.on("moveLeft", () => {
        player.moveLeft();
    })
    socket.on("moveRight", () => {
        player.moveRight();
    })
    socket.on("moveUp", () => {
        player.moveUp();
    })
    socket.on("moveDown", () => {
        player.moveDown();
    })


    socket.on('disconnect',function(){
		delete PLAYERS[id];
	});

    setInterval(() => {
        io.emit("state", { 
          "players": Object.values(PLAYERS)
        });
      }, 25)








    //auth 
    socket.on("check",(data)=>{
        if(data.username==="bob" && data.password==="bobby1"){
            socket.emit("success",{token:"validatedSuccess"});
        }else{
            socket.emit("wrong");
        }
    })
    

    socket.on("checkToken",(data)=>{
        if(data.token==="validatedSuccess"){
            socket.emit("correctToken");
        }else{
            socket.emit("wrongToken");
        }
    })

    // debug
    if(DEBUG){
        socket.on("debug",(data)=>{
            console.log(data);
        })
    }

})

app.use('/sprites', express.static(path.join(__dirname, 'sprites')))


app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/check.html");
})

app.get('/check.css', function(req, res) {
    res.sendFile(__dirname + "/" + "check.css");
  });


app.get("/game",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
})

PORT = process.env.PORT || 5500;
http.listen(PORT,()=>{console.log(`Listening on port ${PORT}`)});