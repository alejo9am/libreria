import mongoose from 'mongoose';
import { CarroSchema } from './carro.mjs';

const Schema = mongoose.Schema;

const schema = Schema({
  dni: { type: String, required: true },
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  direccion: { type: String, required: true },
  rol: { type: String, required: true, enum: ['ADMIN', 'CLIENTE'] },
  email: { type: String, required: true },
  password: { type: String, required: true },
  carro: { type: CarroSchema, default: null },
});

export const Usuario = mongoose.model('Usuario', schema);
