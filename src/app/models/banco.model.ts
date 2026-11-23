export interface Banco {
  id: string; // O UUID, dependiendo de cómo lo devuelva Java
  codigoBanco: string;
  nombre: string;
  nombreCorto: string;
  // ... otros campos
}