require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB 
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error conectando a MongoDB", err));

// Modelo de usuario
const usuarioSchema = new mongoose.Schema({
  usuario: String,
  password: String,
});
const Usuario = mongoose.model("Usuario", usuarioSchema);

// Dispositivo 
const dispositivoSchema = new mongoose.Schema({
  nombre: String,
  marca: String,
  tipo: String,
  descripcion: String,
  imagen: String, 
});
const Dispositivo = mongoose.model("Dispositivo", dispositivoSchema);

// comentarios
const comentarioSchema = new mongoose.Schema({
  dispositivoId: { type: mongoose.Schema.Types.ObjectId, required: true },
  usuario: { type: String, required: true },
  comentario: { type: String, required: true },
});
const Comentario = mongoose.model("Comentario", comentarioSchema);

// Ruta de login sin autenticación con JWT
app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  const user = await Usuario.findOne({ usuario, password }); // Comparación directa
  if (!user)
    return res
      .status(400)
      .json({ message: "Usuario o contraseña incorrectos" });

  res.json({ message: "Login exitoso" });
});

// Rutas CRUD 
app.get("/dispositivos", async (req, res) => {
  const dispositivos = await Dispositivo.find();
  res.json(dispositivos);
});

app.get("/dispositivos/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de dispositivo no válido" });
    }
    const dispositivo = await Dispositivo.findById(req.params.id);
    if (!dispositivo) {
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }
    res.json(dispositivo);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el dispositivo" });
  }
});

app.post("/dispositivos", async (req, res) => {
  try {
    const nuevoDispositivo = new Dispositivo(req.body);
    await nuevoDispositivo.save();
    res.json({ message: "Dispositivo agregado" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar el dispositivo" });
  }
});

app.put("/dispositivos/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de dispositivo no válido" });
    }
    await Dispositivo.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Dispositivo actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el dispositivo" });
  }
});

app.delete("/dispositivos/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de dispositivo no válido" });
    }
    await Dispositivo.findByIdAndDelete(req.params.id);
    res.json({ message: "Dispositivo eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el dispositivo" });
  }
});

// Rutas de comentarios
app.get("/comentarios/:dispositivoId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.dispositivoId)) {
      return res.status(400).json({ message: "ID de dispositivo no válido" });
    }
    const comentarios = await Comentario.find({
      dispositivoId: req.params.dispositivoId,
    });
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener comentarios" });
  }
});

app.post("/comentarios", async (req, res) => {
  try {
    const { dispositivoId, usuario, comentario } = req.body;

    if (!mongoose.Types.ObjectId.isValid(dispositivoId)) {
      return res.status(400).json({ message: "ID de dispositivo no válido" });
    }

    const nuevoComentario = new Comentario({
      dispositivoId: new mongoose.Types.ObjectId(dispositivoId),
      usuario,
      comentario,
    });

    await nuevoComentario.save();
    res.json({ message: "Comentario agregado" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar el comentario" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
