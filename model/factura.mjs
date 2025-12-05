import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = Schema({
  numero: { type: String, required: true },
  fecha: { type: Date, required: true },
  razonSocial: { type: String },
  direccion: { type: String },
  email: { type: String },
  dni: { type: String },
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  subtotal: { type: Number, required: true, default: 0 },
  iva: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  cliente: { type: Schema.Types.Mixed, required: true },
});

export const Factura = mongoose.model('Factura', schema);
