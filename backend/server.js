const { Server } = require("socket.io"); ;

const io = new Server(1024, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.use((socket, next) => {
  // next(new Error("unauthorized event"));
  // socket.disconnect(true)
  console.log(socket.handshake.address+" connected");
  next();
});

io.on("connection", (socket) => {
  console.log("socket iiiiiiiiiiiiii");
  
  socket.on("SYN", (data) => {
    console.log("data SYN " + JSON.stringify(data));
    socket.join(data.mySeq);
    //console.log(data.joinId != null && data.joinId != "undefined");
    
    if(data.joinId != null &&  data.joinId != "undefined"){
      socket.to(data.joinId).emit("hello", data.mySeq);
      socket.emit("hello", data.joinId);
    }
    socket.on("text", (data) => {
      console.log("text in"+ data.text + data.oppoId);
      socket.to(data.oppoId).emit("text",data.text)
    })
    
    socket.on("file-meta", (data) => {
      console.log("meta");
      console.log(JSON.stringify(data));
      socket.in(data.oppoId).emit("rec-meta", data.metadata);
    });
    socket.on("start", (data) => {
      console.log("start");
      console.log(data);
      socket.in(data.oppoId).emit("rec-start", {});
    });
    socket.on("file-raw", (data) => {
      console.log("file-raw");
      socket.in(data.oppoId).emit("rec-raw", data.buffer);
    });
  });
});





