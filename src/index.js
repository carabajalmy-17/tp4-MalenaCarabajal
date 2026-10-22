const express = require("express");
const path = require("node:path");

const { leerJson } = require("./archivos");

const expressLayouts = require("express-ejs-layouts");

const PORT = 3000;
const rutaDatos = path.join(__dirname, "..", "datos", "mascotas.json");
async function main() {
    const mascotas = await leerJson(rutaDatos);
    const app = express();

    app.set("view engine", "ejs"); //motor de vistas
    app.set("views", path.join(__dirname, "..", "views")); //indica donde estan las vistas 


    app.use(expressLayouts);
    app.set("layout", "layouts/main");

    app.use(express.static(path.join(__dirname, "..", "public")));

    // Middleware para leer los datos de los formularios
    app.use(express.urlencoded({ extended: true }));

    app.get("/api/mascotas", (req, res) => {
        res.json(mascotas);
    });

    app.get("/", (req, res) => {
        res.render("inicio", { titulo: "Inicio" });
    });

    app.get("/mascotas", (req, res) => {
        res.render("productos/lista", { titulo: "Mascotas", mascotas });
    });
    app.get("/mascotas/nuevo", (req, res) => {
        res.render("productos/nuevo", { titulo: "Nueva Mascota", error: null, valores: {} });
    });

    app.post("/mascotas", (req, res) => {
        const { nombre, especie , edad, descripcion, estado } = req.body;

        const nombreLimpio = String(nombre ?? "").trim();
        const descripcionLimpia = String(descripcion ?? "").trim();
        const especieLimpia = String(especie ?? "").trim();
        const edadNumerico = Number(edad);
        const estadoLimpio = String(estado ?? "").trim();
        if (
            !nombreLimpio ||
            !especieLimpia ||
            !descripcionLimpia ||
            !estadoLimpio ||
            !Number.isFinite(edadNumerico) ||
            edadNumerico <= 0
        ) {
            return res.status(400).render("productos/nuevo", {
                titulo: "Nueva Mascota",
                error: "Completá todos los campos con valores válidos.",
                valores: req.body,
            });
        }
        const ultimoId = mascotas.reduce(
            (mayorId, producto) => Math.max(mayorId, producto.id),
            0,
        );

        mascotas.push({
            id: ultimoId + 1,
            nombre: nombreLimpio,
            especie: especieLimpia,
            descripcion: descripcionLimpia,
            edad: edadNumerico,
            estado: estadoLimpio,
        });
        res.redirect("/mascotas");
    });

    app.get("/mascotas/:id", (req, res) => {
        const id = Number(req.params.id);
        const mascota = mascotas.find((elemento) => elemento.id === id);

        if (!mascota) {
            return res.render("no-encontrado", {
                titulo: 'Mascota no encontrada', mensaje:" no se encontro el amiguito que estabas buscando, prueba con otra opcion"
            });
        }

        res.render("productos/detalle", { titulo: mascota.nombre, mascota });
    });


    app.listen(PORT, () => {
        console.log(`aplicacion funcionando en http://localhost:${PORT}`);
    })


} main().catch((error) => {
    console.error("no se encontro la pagina", error);
    process.exitCode = 1;
});