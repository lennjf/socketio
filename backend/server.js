const express = require("express");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
console.log(process.env);
const app = express();

app.use(express.json());


const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
}

const appserver = app.listen(1024, console.log("server is started on 1024"));

const io = new Server(appserver, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.use((socket, next) => {
  // next(new Error("unauthorized event"));
  // socket.disconnect(true)
  console.log(socket.handshake.address + " connected");
  next();
});

io.on("connection", (socket) => {
  console.log("socket iiiiiiiiiiiiii");

  socket.on("SYN", (data) => {
    console.log("data SYN " + JSON.stringify(data));
    socket.join(data.mySeq);
    //console.log(data.joinId != null && data.joinId != "undefined");

    if (data.joinId != null && data.joinId != "undefined") {
      socket.to(data.joinId).emit("hello", data.mySeq);
      socket.emit("hello", data.joinId);
    }
    socket.on("text", (data) => {
      console.log("text in" + data.text + data.oppoId);
      socket.to(data.oppoId).emit("text", data.text);
    });

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

