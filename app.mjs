import express from 'express';
import path from 'path';
import url from 'url';

const STATIC_DIR = url.fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

const app = express();
app.use('/', express.static(path.join(STATIC_DIR, 'public')));

// Ruta específica para la SPA de librería - sirve el index.html para cualquier subruta
app.use('/libreria*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'public/libreria/index.html'));
});

// Catch-all para CUALQUIER otra ruta no encontrada
// Redirige a la página 404 de la SPA
app.all('*', function (req, res, next) {
  console.error(`${req.originalUrl} not found!`);
  
  // Redirigir a la página 404 de la SPA con la URL solicitada como parámetro
  const urlSolicitada = encodeURIComponent(req.originalUrl);
  res.redirect(`/libreria/error-404.html?url=${urlSolicitada}`);
})

app.listen(PORT, function () {
  console.log(`Static HTTP server listening on ${PORT}`)
})
