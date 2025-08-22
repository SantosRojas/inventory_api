// Punto de entrada de la API siguiendo Clean Architecture
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./interfaces/routes";

const PORT = process.env.PORT || 4000;

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

// Registrar rutas
registerRoutes(app);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
