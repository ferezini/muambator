import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { format } from "date-fns";
import Form from "./Form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const List = () => {
  const [purchases, setPurchases] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const purchasesPerPage = 20;
  const pagesVisited = pageNumber * purchasesPerPage;
  const [editMode, setEditMode] = useState({});
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState({});

  const api = axios.create({
    baseURL: "http://localhost:5000",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/compras");
        const sortedPurchases = response.data.sort((a, b) => {
          return new Date(b.data) - new Date(a.data);
        });
        let trackingCodes
        for (let i = 0; i < sortedPurchases.length; i++) {
          const purchase = sortedPurchases[i];
          trackingCodes = sortedPurchases.map((purchase) => purchase.trackingCode);
        }
        const valores = await getTrackingStatus(trackingCodes)
        for (let i = 0; i < sortedPurchases.length; i++) {
          console.log(valores['response'][i]['eventos']) 
          const cidade = valores?.response?.[i]?.eventos?.[0]?.unidade?.endereco?.cidade ?? "";
          const cidadeDestino = valores?.response?.[i]?.eventos?.[0]?.unidadeDestino?.nome ?? "";
          console.log(cidadeDestino)
             
          try {
              const texto = valores['response'][i]['eventos'][0]['descricao'] + " / " + cidade + " indo para: " + cidadeDestino
              updateTrackingStatus(sortedPurchases[i]._id, texto)
              console.log(sortedPurchases[i]._id, valores['response'][i]['eventos'][0]['descricao'])
          } catch {
            updateTrackingStatus(sortedPurchases[i]._id, 'Encomenda ainda não Encontrada')
          }
        }        
        setPurchases(sortedPurchases);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [refresh]);

  async function getTrackingStatus(trackingCode) {
    try {
      const response = await api.get(`/rastreio/${trackingCode}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  const stores = { 1: "AliExpress", 2: "Alibaba", 3: "Outros" };
  const paymentsMethods = { 1: "Cartão", 2: "Boleto", 3: "Outros" };
  const displayPurchases = purchases
  .slice(pagesVisited, pagesVisited + purchasesPerPage)
  .filter((purchase) => purchase.valueTotal)
  .map((purchase, index) => {
    const isOddRow = index % 2 === 0;
    const rowClassName = isOddRow ? "oddRow" : "evenRow";
    const formattedValue = purchase.valueTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    return (
      <tr key={purchase._id} className={rowClassName}>
        <td>{editMode[purchase._id] ? (
          <input type="text" defaultValue={format(new Date(purchase.data), "dd/MM/yyyy")} 
          onChange={(e) => handleEditChange(purchase._id, 'data', e.target.value)}/>
        ) : (
          format(new Date(purchase.data), "dd/MM/yyyy")
        )}</td>
        <td>{editMode[purchase._id] ? (
          <input type="text" defaultValue={purchase.product} 
          onChange={(e) => handleEditChange(purchase._id, 'product', e.target.value)} />
        ) : (
          purchase.product
        )}</td>
        <td>{editMode[purchase._id] ? (
          <input type="number" defaultValue={purchase.quantity} 
          onChange={(e) => handleEditChange(purchase._id, 'quantity', e.target.value)} />
        ) : (
          purchase.quantity
        )}</td>
        <td>{editMode[purchase._id] ? (
          <input type="text" defaultValue={purchase.valueTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} 
          onChange={(e) => handleEditChange(purchase._id, 'valueTotal', e.target.value)}/>
        ) : (
          purchase.valueTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
        )}</td>
        <td>{editMode[purchase._id] ? (
          <select defaultValue={purchase.store} onChange={(e) => handleEditChange(purchase._id, 'store', e.target.value)}>
            <option value={1}>AliExpress</option>
            <option value={2}>Alibaba</option>
            <option value={3}>Outros</option>
          </select>
        ) : (
          stores[purchase.store]
        )}</td>
        <td>{editMode[purchase._id] ? (
          <input type="text" defaultValue={purchase.codigoCompra} onChange={(e) => handleEditChange(purchase._id, 'codigoCompra', e.target.value)} />
        ) : (
          purchase.codigoCompra
        )}</td>
        <td>{editMode[purchase._id] ? (
          <select defaultValue={purchase.formaPagamento} onChange={(e) => handleEditChange(purchase._id, 'formaPagamento', e.target.value)} >
            <option value={1}>Cartão</option>
            <option value={2}>Boleto</option>
            <option value={3}>Outros</option>
          </select>
        ) : (
          paymentsMethods[purchase.formaPagamento]
        )}</td>
        <td>{editMode[purchase._id] ? (
          <input type="text" defaultValue={purchase.trackingCode} onChange={(e) => handleEditChange(purchase._id, 'trackingCode', e.target.value)} />
        ) : (
          purchase.trackingCode
        )}</td>
        <td>
         {trackingStatus[purchase._id]}
        </td>
        <td>
          {editMode[purchase._id] ? (
            <button onClick={() => handleSave(purchase)}>Salvar</button>
          ) : (
            <button onClick={() => handleEdit(purchase)}>Editar</button>
          )}
        </td>
        <td>
          <button onClick={() => deletePurchase(purchase._id)}>Excluir</button>
        </td>
      </tr>
    );
  });
  const pageCount = Math.ceil(purchases.length / purchasesPerPage);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleListUpdate = () => {
    setRefresh(!refresh);
  };

  const handleEdit = (purchase) => {
    setEditMode({ ...editMode, [purchase._id]: true });
  };
  
  const handleSave = async (purchase) => {
    try {
      console.log(purchase)
      await api.put(`/compras/${purchase._id}`, purchase);
      setRefresh(!refresh);
      setEditMode({ ...editMode, [purchase._id]: false });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditChange = (id, field, value) => {
    setPurchases(prevState => {
      const updatedPurchase = prevState.find(purchase => purchase._id === id);
      if (field === "valueTotal") {
        updatedPurchase[field] = removeCurrencyMask(value);
      } else if (field === "data") {
        updatedPurchase[field] = convertDate(value);
      } else {
        updatedPurchase[field] = value;
      }
      console.log(value)
      return [...prevState];
    });
  };

  const deletePurchase = async (id) => {
    try {
      await api.delete(`/compras/${id}`);
      setRefresh(!refresh);
    } catch (error) {
      console.error(error);
    }
  };  
  
  const updateTrackingStatus = (purchaseId, status) => {
    setTrackingStatus(prevState => ({
      ...prevState,
      [purchaseId]: status
    }));
  }

  function removeCurrencyMask(value) {
    // Remove espaços, a literal "R$" e o separador de milhar (",")
    return value.replace(/\s|R\$/g, "").replace(",", ".");
  }

  function convertDate(dateString) {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month - 1, day);
  }
  return (
    <>
      <Form setList={handleListUpdate} />
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Data Compra</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
                <th>Loja de Compra</th>
                <th>Código da Compra</th>
                <th>Forma de Pagamento</th>
                <th>Código de rastreio</th>
                <th>Status de Rastreamento</th>
                <th>  </th>
                <th>  </th>
              </tr>
            </thead>
            <tbody>{displayPurchases}</tbody>
          </table>
          <ReactPaginate
            previousLabel={"Anterior"}
            nextLabel={"Próximo"}
            pageCount={pageCount}
            onPageChange={changePage}
            containerClassName={"paginationButtons"}
            previousLinkClassName={"previousButton"}
            nextLinkClassName={"nextButton"}
            disabledClassName={"paginationDisabled"}
            activeClassName={"paginationActive"}
          />
        </>
      )}
    </>
  );
};

export default List;
