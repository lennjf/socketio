import { Route } from "react-router-dom"
import React, { useState } from "react";
import Home from "./pages/Home"
import Listen from "./pages/Listen";
// import { BrowserRouter } from "react-router-dom";


export const Context = React.createContext()
function App() {
  const str = `${Math.trunc(Math.random() * 999)}-${Math.trunc(
    Math.random() * 999
  )}-${Math.trunc(Math.random() * 999)}`;
  const [ioState, setIoState] = useState("standby");
  const [my_sequence, setMy_sequence] = useState(str);


  
  return (
    <Context.Provider
      value={{
        ioState,
        setIoState,
        my_sequence,
        setMy_sequence,
      }}
    >
      <div className="App">
        <div>{ioState}</div>
        <span>your sequence number: {my_sequence}</span>
        <Route path="/" component={Home} exact />
        <Route path="/listen" component={Listen} />
      </div>
    </Context.Provider>
  );
  
  
}

export default App;
