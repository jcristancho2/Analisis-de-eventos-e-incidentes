/**
 * Definiciones de tipos para el sistema Cerebro - Agente Clínico FCV
 */

export type CategoriaCentro =
  | 'cardiovascular'
  | 'oncologico'
  | 'pediatrico'
  | 'quirurgico'
  | 'neurologico'
  | 'respiratorio'
  | 'cronico';

export interface CentroExcelencia {
  id: number;
  codigo: string;
  nombre: string;
  categoria: CategoriaCentro;
  descripcion: string;
  pacientesActivos: number;
  pacientesTotales: number;
  alertasActivas: number;
  colorIcono: 'violet' | 'cyan' | 'rose' | 'amber' | 'orange' | 'teal' | 'emerald' | 'blue';
  iconoNombre: string;
}

export type TipoDocumento = 'CC' | 'TI' | 'RC' | 'CE' | 'PA';

export type Sexo = 'Femenino' | 'Masculino';
export type Zona = 'Urbana' | 'Rural';
export type Regimen = 'Contributivo' | 'Subsidiado' | 'Plan adicional' | 'Especial';
export type ViaAcceso = 'Ambulatoria' | 'Urgencias' | 'Remisión' | 'Hospitalización previa';
export type EstadoNutricional = 'Delgadez' | 'Normal' | 'Sobrepeso' | 'Obesidad' | 'Sin medición';
export type EstadoPaciente = 'Activo' | 'Inactivo' | 'En seguimiento' | 'Alta médica';

export interface AlertaClinica {
  id: string;
  tipo: 'control_vencido' | 'cita_proxima' | 'resultado_critico' | 'sin_contacto';
  texto: string; // ej: "Control vencido · control 1 mes · Atrasado 2 meses"
  gravedad: 'alta' | 'media' | 'informativa';
  fechaGeneracion: string;
}

export interface Paciente {
  // Columnas fijas (sticky)
  documento: string; // ej: "CC 1098765432"
  idCliente: string; // ej: "104820"
  paciente: string; // Nombre completo
  alertas: AlertaClinica[];
  ciclo: string; // ej: "1°", "2°", "3°"

  // Columnas sociodemográficas y clínicas dinámicas
  edad: number;
  sexo: Sexo;
  pesoKg: number;
  tallaCm: number;
  imc: number;
  estadoNutricional: EstadoNutricional;
  antecedentes: string;
  eps: string;
  plan: string;
  viaAcceso: ViaAcceso;
  regimen: Regimen;
  telMovil: string;
  estado: EstadoPaciente;
  fNac: string; // YYYY-MM-DD
  rh: string; // ej: "O+", "A+", "B-"
  estadoCivil: string;
  zona: Zona;
  escolaridad: string;
  etnia: string;
  ocupacion: string;
  religion: string;
  afiliacion: string;
  conviven: string;
  telCasa: string;
  email: string;
  direccion: string;

  // Centro asignado
  centroId: number;
  fechaIngreso: string;
  ultimoControl?: string;
  proximoControl?: string;
  observacionesClinicas?: string;
}

export interface MensajeWhatsApp {
  id: string;
  pacienteId: string;
  nombrePaciente: string;
  documento: string;
  telefonoDestino: string; // En modo prueba muestra el número de pruebas
  mensaje: string;
  tipoPlantilla: 'recordatorio_control' | 'alerta_vencimiento' | 'confirmacion_asistencia' | 'educacion_paciente';
  canal: 'WhatsApp Business API';
  estado: 'Entregado' | 'Leído' | 'Enviado' | 'Fallido';
  fechaHora: string;
}

export interface ColumnDefinition {
  key: keyof Paciente | 'acciones';
  label: string;
  isSticky?: boolean;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
}

/**
 * Contrato mínimo que una enfermera completa durante el empalme.  En una
 * siguiente integración este objeto puede persistirse en la historia clínica.
 */
export interface FichaEmpalme {
  nombreCentro: string;
  codigo: string;
  categoria: CategoriaCentro;
  descripcion: string;
  volumenEstimado: number;
  camposPrioritarios: string[];
  alertasPrioritarias: string[];
  frecuenciaRevision: string;
}

export type ClasificacionPrevenibilidad =
  | 'Prevenible'
  | 'No prevenible'
  | 'Pendiente de validación';

export type TipoEventoSeguridad = 'Incidente' | 'Evento adverso';

export interface EventoSeguridadPaciente {
  id: string;
  fecha: string;
  servicio: string;
  sexo: Sexo;
  edad: number;
  regimen: Regimen;
  tipo: TipoEventoSeguridad;
  resumen: string;
  dano: 'Sin daño' | 'Daño leve' | 'Daño moderado';
  clasificacion: ClasificacionPrevenibilidad;
  justificacion: string;
  hechosConfirmados: string[];
  pendientes: string[];
  evidencias: string[];
  estadoInvestigacion: 'Completa' | 'En revisión' | 'Pendiente de evidencia';
}
