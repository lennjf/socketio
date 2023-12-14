import React, { useContext, useEffect } from "react";
import { io } from "socket.io-client";
import { Context } from '../App';
import {useHistory} from "react-router";


var socket;
function Home() {
  // const [ioState, setIoState] = useState("standby");
  // const [my_sequence, setMy_sequence] = useState(
  //   `${Math.trunc(Math.random() * 999)}-${Math.trunc(
  //     Math.random() * 999
  //   )}-${Math.trunc(Math.random() * 999)}`
  // );
  const {ioState, setIoState} = useContext(Context);
  const {my_sequence, setMy_sequence} = useContext(Context);


  const history = useHistory();

  
  function opthandler(option){
    var isA = option === "A" ? true : false;
    if (!isA && document.getElementById("join-id").value === "") {
      console.log("empty");
      return;
    }
    console.log(isA);
    const URL =
      process.env.NODE_ENV === "production"
        ? undefined
        : "http://localhost:1024";
    //http://localhost:1024
    console.log("url: "+URL);
    socket = io(URL, { reconnectionDelay: 3000 });
    socket.on("connect_error", (error) => {
      console.log("conn err: ", error);
    });
    socket.on("disconnect", (reason) => {
      console.log(`on disconn ${reason}`, socket.disconnect);

      history.push("/");
    });
    socket.io.on("reconnect_attempt", (attempt) => {
      console.log("attempt.....", attempt);
    });

    socket.on("connect", () => {
      console.log(socket);
      setIoState("connected");
      isA
        ? history.push({ pathname: "/listen", socket: socket })
        : history.push({
            pathname: "/listen",
            socket: socket,
            joinId: document.getElementById("join-id").value,
          });
    });
  }
  
  return (
    <div>
      <button onClick={() => opthandler("A")}>
        option a: listen and wait for others
      </button>
      <br />
      <br />
      <br />
      <input type="text" id="join-id" />
      <br />
      <button onClick={()=>opthandler("B")}>
        option b: input a sequence number to connect to someone
      </button>
    </div>
  );
}

export default Home
