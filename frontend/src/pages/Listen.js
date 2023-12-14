import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router";
import { Context } from '../App';
// import { io } from "socket.io-client";
import download from "../external/download.js"


function Listen() {
  let filename;
  let total_buffer_size;
  let buffer_size;
  let transmitted=0;
  let buffer = [];
  let progress_node;
  let oppoId;
  
  //console.log( socket);
  const location = useLocation();
  const socket = location.socket;
  const joinId = location.joinId;
  const history = useHistory();
  const {
    my_sequence,
    setMy_sequence,
  } = useContext(Context);

  if (typeof socket == "undefined") {
    history.push("/");
  } else {
    socket.on("hello", (data) => {
      console.log("hello.....", data);
      document.getElementById("waitspan").innerHTML="Linked"
      //oppoId = joinId;
      oppoId = data;
      document.getElementById("sendblock").style.display="block";
      document.getElementById("sendSeq").style.display = "none";
      
    });
    socket.on("text", (data) => {
      console.log(data);

      let el = document.createElement("div");
      el.innerHTML = `
            <div>remote say:  ${data}</div>
        `;
      document.getElementById("result").appendChild(el);
    });
     socket.emit("SYN", { mySeq: my_sequence, joinId: joinId });

    socket.on("rec-meta", (metadata) => {
      filename = metadata.filename;
      total_buffer_size = metadata.total_buffer_size;
      buffer_size = metadata.buffer_size;
      buffer = []
      let el = document.createElement("div");
      el.innerHTML = `
            <div class="progress">0%</div>
            <div class="filename">${filename}</div>
        `;
      document.querySelector(".files-list").appendChild(el);
      progress_node = el.querySelector(".progress");
      console.log("oppoid: " + oppoId);
      socket.emit("start", {
        oppoId: oppoId,
      });
    });
    socket.on("rec-raw", (buffercoming) => {
      console.log("rec-raw");
      buffer.push(buffercoming);
      transmitted += buffercoming.byteLength;
      progress_node.innerHTML =
        Math.trunc((transmitted / total_buffer_size) * 100) + "%";
      if (transmitted == total_buffer_size) {
        download(new Blob(buffer), filename);
        filename='';
        total_buffer_size=0;
        buffer_size=0;
        transmitted = 0;
        buffer = [];
        progress_node=null;
      } else {
        socket.emit("start", {
          oppoId: oppoId,
        });
      }
    });


  }
  
  
  function sendText(){
    console.log("text send" + oppoId);
    if(oppoId!=null){
      
      console.log(document.getElementById("text").value);
      socket.emit("text", {
        text: document.getElementById("text").value,
        'oppoId': oppoId,
      });
      
    }
  }

  function fileHandler(e){
    let file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
      buffer = new Uint8Array(reader.result);
      console.log(buffer);
      let el = document.createElement("div");
      el.innerHTML = `
                <div class="progress">0%</div>
                <div class="filename">${file.name}</div>
            `;
      document.querySelector(".files-list").appendChild(el);
      shareFile({
                filename: file.name,
                total_buffer_size:buffer.length,
                buffer_size:1024
            },buffer,el.querySelector(".progress"));
        }
        reader.readAsArrayBuffer(file)
    };
    function shareFile(metadata,buffer,progress_node){
        socket.emit("file-meta", {
          oppoId: oppoId,
          metadata: metadata,
        });
        socket.on("rec-start",()=>{
            let chunk = buffer.slice(0,metadata.buffer_size);
            buffer= buffer.slice(metadata.buffer_size,buffer.length);
            progress_node.innerHTML = Math.trunc((metadata.total_buffer_size-buffer.length)/metadata.total_buffer_size * 100) + "%";
            if(chunk.length != 0){
                socket.emit("file-raw", {
                  oppoId: oppoId,
                  buffer: chunk,
                });
            }

        })
    }
  


  
  
  return (
    <div style={{ marginTop: "30px" }}>
      <div id="sendSeq" style={{ display: "block" }}>
        <b>send your sequence to your friend to connect when your are a host</b>
        <br />
        <br />
        <br />
        <br />
      </div>

      <span id="waitspan">waiting</span>

      <div id="sendblock" style={{ border : 0,display: "none" }}>
        <div id="oppoid"></div>
        <textarea id="text" defaultValue={"type in"}></textarea>
        <button onClick={sendText}>send</button>
        <div className="file-input">
          <label>click here to select files for sharing</label>
          <br />
          <input type="file" id="file-input" onChange={(e) => fileHandler(e)} />
          <div className="files-list">
            <div className="title">shared files</div>
          </div>
        </div>
        <div id="result"></div>
      </div>
    </div>
  );
}

export default Listen
