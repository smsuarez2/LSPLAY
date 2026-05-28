import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.get("/usuarios", (req, res) => {
  res.json([
    {
      id: 1,
      nombre: "Selena"
    }
  ]);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});