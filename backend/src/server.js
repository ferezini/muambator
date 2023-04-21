const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { rastrearEncomendas } = require('correios-brasil');

// Configurações do servidor
const app = express();
const PORT = process.env.PORT || 5000;

// Configurações do banco de dados
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://omnistack:rfa1985@cluster0.4ree7.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado ao banco de dados!");
  })
  .catch((err) => {
    console.log("Erro ao conectar ao banco de dados:", err);
  });

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.post("/compras", async (req, res) => {
  console.log("passei aqui")
  console.log(req.body)
  try {
    const compra = await Compra.create(req.body);
    res.status(201).json(compra);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erro ao cadastrar a compra" });
  }
});

app.get("/compras", async (req, res) => {
    console.log("passei aqui 2")
    try {
        const compras = await Compra.find();
        res.status(200).json(compras);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao buscar as compras" });
    }
});

app.put("/compras/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, product, quantity, valueTotal, store, codigoCompra, formaPagamento, trackingCode } = req.body;

    console.log(data)
    console.log(product)
    console.log(quantity)
    console.log(valueTotal)
    console.log(store)
    console.log(codigoCompra)
    console.log(formaPagamento)
    console.log(trackingCode)

    const compra = await Compra.findById(id);
    if (!compra) {
      return res.status(404).json({ message: "Compra não encontrada" });
    }
    console.log(data)
    console.log(product)
    console.log(quantity)
    console.log(valueTotal)
    console.log(store)
    console.log(codigoCompra)
    console.log(formaPagamento)
    console.log(trackingCode)
    compra.data = data;
    compra.product = product;
    compra.quantity = quantity;
    compra.valueTotal = valueTotal;
    compra.store = store;
    compra.codigoCompra = codigoCompra;
    compra.formaPagamento = formaPagamento;
    compra.trackingCode = trackingCode;

    await compra.save();

    res.status(200).json(compra);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erro ao atualizar a compra" });
  }
});

app.delete("/compras/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const compra = await Compra.findByIdAndDelete(id);
    console.log(compra)
    if (!compra) {
      return res.status(404).json({ message: "Compra não encontrada" });
    }
    res.status(200).json(compra);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erro ao deletar a compra" });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});

app.get("/rastreio/:codigo", async (req, res) => {
  const { codigo } = req.params;
  console.log(codigo)
  let codRastreio = codigo.split(',').map(item => `${item}`.trim() || 'VAZIO');
  for (let i = 0; i < codRastreio.length; i++) {
    console.log(codRastreio[i]);
  }
  console.log(codRastreio);
  try {
    const response = await rastrearEncomendas(codRastreio);
 //   console.log(eventos)
   res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erro ao acessar codigo" });
  }
});

const compraSchema = new mongoose.Schema({
    data: { type: Date, required: true },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    valueTotal: { type: Number, required: true },
    store: { type: Number, required: true },
    codigoCompra: { type: Number, required: true },
    formaPagamento: { type: Number, required: true },
    trackingCode: { type: String },
  });
  
  const Compra = mongoose.model("Compra", compraSchema);