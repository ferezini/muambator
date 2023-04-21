import Form from "./components/Form";
import List from "./components/List";
import React, { useState } from "react";
import './App.css';

function App() {
  const [list, setList] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const addPurchase = (purchase) => {
    setPurchases([...purchases, purchase]);
  };

  return (
    <div className="App">
      <h1>Cadastro de Compras</h1>
      <List purchases={purchases}/>
    </div>
  );
}

export default App;
