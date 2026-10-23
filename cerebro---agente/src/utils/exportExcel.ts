import { Paciente } from '../types/clinical';
import { AVAILABLE_COLUMNS } from '../data/mockClinicalData';

/**
 * Genera y descarga un archivo CSV con BOM compatible con Microsoft Excel
 */
export function exportPatientsToExcel(pacientes: Paciente[], centroNombre: string) {
  if (pacientes.length === 0) {
    alert('No hay pacientes para exportar.');
    return;
  }

  // Encabezados
  const headers = AVAILABLE_COLUMNS.map((col) => `"${col.label.replace(/"/g, '""')}"`);

  // Filas
  const rows = pacientes.map((p) => {
    return AVAILABLE_COLUMNS.map((col) => {
      let val = (p as any)[col.key];

      if (col.key === 'alertas') {
        val = p.alertas.map((a) => a.texto).join(' | ') || 'Al día';
      } else if (val === undefined || val === null) {
        val = '';
      }

      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(';');
  });

  // UTF-8 BOM (\uFEFF) para que Excel reconozca tildes y caracteres especiales
  const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = centroNombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `cerebro_fcv_${sanitizedName}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
