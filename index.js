const express = require("express")
const {createServer} = require("http")
const path = require("path")
const { Server } = require("socket.io");
const {writeFile } = require("fs")
const { v4: uuidv4 } = require("uuid");
const HashMap = require("hashmap");
const cron = require("node-cron");
const fsExtra = require("fs-extra");

var map = new HashMap();

var task = cron.schedule("*/10 * * * *", () => {
  console.log("running every 10 minutes");
  
  fsExtra.emptyDir(path.join(__dirname, "/doc/"));
});



const app = express()
const httpserver = createServer(app);
const ioServer = new Server(httpserver, {
  maxHttpBufferSize: 9e6,
});



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client.html"));
  })

app.get("/doc/:id", (req, res) => {
  console.log(req.params);
  var filepath=map.get(req.params.id)
  if(filepath){
    res.sendFile(filepath);
  }
});

ioServer.on("connection", (socket) => {
  var countTask = cron.schedule("* * * * *", () => {
    console.log("connection count: ", socket.server.engine.clientsCount);
  });
  console.log("a user connected");
  console.log("token: ",socket.handshake.auth.token);
  setTimeout(() => socket.disconnect(true), 6000000);
  socket.on("text", (data) => {
    console.log("text in");
    console.log(data);

    const connectedSockets = Array.from(ioServer.sockets.sockets.values());
    connectedSockets.map((s) =>{
        console.log("s token : ",s.handshake.auth.token);
        if(s.handshake.auth.token ===  data.receiver){
            s.emit("text",data);
        }     
    });
     
    
    //console.log("count: ",socket.server.engine.clientsCount);
  });

  socket.on("file", (data) => {
    console.log("file coming ",data.filename);
    var filepath =path.join(__dirname, "/doc/", data.filename);
    var uuid = uuidv4()
   
    const connectedSockets = Array.from(ioServer.sockets.sockets.values());
    connectedSockets.map((s) => {
      console.log("s token : ", s.handshake.auth.token);
      if ((s.handshake.auth.token != socket.handshake.auth.token) && (s.handshake.auth.token === data.receiver)) {
        task.stop();
        writeFile(filepath, data.file, (err) => {
          console.log(err);
        });
        map.set(uuid, filepath);
        s.emit("file", {
          sender: data.sender,
          receiver: data.receiver,
          id: uuid,
          filename: data.filename,
        });
        task.start()
      }
    });
  })
  
});



httpserver.listen(2000, () => {
  console.log("app started ...");
});