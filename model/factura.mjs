import mongoose from 'mongoose';
import { ItemSchema } from './item.mjs';

const Schema = mongoose.Schema;

const schema = Schema({
  numero: { type: String, required: true },
  fecha: { type: Date, required: true },
  razonSocial: { type: String },
  direccion: { type: String },
  email: { type: String },
  dni: { type: String },
  items: [ItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  iva: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  cliente: { type: Schema.Types.Mixed, required: true },
});

export const Factura = mongoose.model('Factura', schema);
