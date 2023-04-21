import React, { useState } from "react";
import axios from "axios";
import './Form.css';
import CurrencyInput from "react-currency-input-field";

const Form = ({ setList }) => {
  const [data, setData] = useState(new Date());
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [valueTotal, setValueTotal] = useState("");
  const [store, setStore] = useState(1);
  const [codigoCompra, setCodigoCompra] = useState("");
  const [formaPagamento, setFormaPagamento] = useState(1);
  const [trackingCode, setTrackingCode] = useState("");

  const api = axios.create({
    baseURL: "http://localhost:5000",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!store || store === 0) {
        alert("Por favor, selecione uma loja");
        return;
      }
      if (!valueTotal || valueTotal <= 0) {
        alert("Por favor, insira um valor maior que 0.");
        return;
      }
      const convertedValue = parseFloat(valueTotal.replace(",", "."));
      data.setHours(data.getHours() + 8);
      const response = await api.post("/compras", {
        data: data.toISOString(),
        product,
        quantity,
        valueTotal: convertedValue,
        store,
        codigoCompra,
        formaPagamento,
        trackingCode,
      });
      setData(new Date());
      setProduct("");
      setQuantity("");
      setValueTotal("");
      setStore(1);
      setCodigoCompra("");
      setTrackingCode("");
      setFormaPagamento(1);
      setList(); // chamando a função setList para atualizar a lista
    } catch (error) {
      console.error(error);
    }
  };

  function convertDate(dateString) {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month - 1, day);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="data">Data da Compra:</label>
        <input type="date" id="data" name="data" required className="form-input" value={data.toISOString().slice(0, 10)} onChange={(e) => setData(new Date(e.target.value))} />      
      </div>
      <div className="form-group">
        <label htmlFor="produto">Produto:</label>
        <input
          type="text"
          id="produto"
          name="produto"
          required
          className="form-input"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="quantidade">Quantidade:</label>
        <input
          type="number"
          id="quantidade"
          name="quantidade"
          required
          className="form-input"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="valor">Valor Total:</label>
        <CurrencyInput
          id="valor"
          name="valor"
          required
          className="form-input"
          value={valueTotal}
          onValueChange={(value) => setValueTotal(value)}
          prefix="R$"
          decimalSeparator=","
          groupSeparator="."
          decimalScale={2}
          fixedDecimalLength={false}
        />
      </div>
      <div className="form-group">
        <label htmlFor="loja">Loja de Compra:</label>
        <select
          id="loja"
          name="loja"
          required
          className="form-input"
          value={store}
          onChange={(e) => setStore(e.target.value)}
        >
          <option value={1}>Aliexpress</option>
          <option value={2}>Alibaba</option>
          <option value={3}>Outro</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="codigoCompra">Código da Compra:</label>
        <input
          type="text"
          id="codigoCompra"
          name="codigoCompra"
          className="form-input"
          value={codigoCompra}
          onChange={(e) => setCodigoCompra(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="formaPagamento">Forma de Pagamento:</label>
        <select
          id="formaPagamento"
          name="formaPagamento"
          required
          className="form-input"
          value={store}
          onChange={(e) => setFormaPagamento(e.target.value)}
        >
          <option value={1}>Cartão</option>
          <option value={2}>Boleto</option>
          <option value={3}>Outro</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="codigo">Código de Rastreio:</label>
        <input
          type="text"
          id="codigo"
          name="codigo"
          className="form-input"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
        />
      </div>
      <button type="submit">Cadastrar</button>
    </form>
  );
};

export default Form;



