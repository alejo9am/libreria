import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = Schema({
  isbn: { type: String, required: true },
  titulo: { type: String, required: true },
  autores: { type: String, required: true },
  portada: { type: String, required: true },
  resumen: { type: String, required: true },
  stock: { type: Number, required: true },
  precio: { type: Number, required: true },
});

export const Libro = mongoose.model('Libro', schema);
