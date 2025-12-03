// analisis.js
const math = require('mathjs');

// --- DEFINICIONES DE MATERIAS Y ESTRUCTURA ---
const MATERIAS = [
  "Español", "Ingles", "Matematicas", "Artes", "Formacion_Civica_y_Etica",
  "Historia", "Educacion_Fisica", "Quimica", "Tecnologia"
];

const COLUMNAS_BASE_GRANULAR = ['Asistencia_Gral', 'Conducta_Gral'];
const TEMAS_PARCIALES = Array.from({ length: 6 }, (_, i) => `Cal_T${i + 1}`);

const EXPECTED_CAL_COLS = MATERIAS.flatMap(m =>
  TEMAS_PARCIALES.map(t => `${m}_${t}`.toLowerCase())
);

const EXPECTED_COLUMNS = [
  'nombre',
  ...COLUMNAS_BASE_GRANULAR.map(c => c.toLowerCase()),
  ...EXPECTED_CAL_COLS
];

// --- FUNCIONES AUXILIARES ---

/**
 * Normaliza las columnas del DataFrame a minúsculas
 */
function normalizeColumns(data) {
  return data.map(row => {
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      normalizedRow[key.toLowerCase()] = row[key];
    });
    return normalizedRow;
  });
}

/**
 * Calcula el promedio de múltiples valores
 */
function calcularPromedio(valores) {
  const valoresValidos = valores.filter(v => v != null && !isNaN(v));
  if (valoresValidos.length === 0) return 0;
  return valoresValidos.reduce((acc, val) => acc + val, 0) / valoresValidos.length;
}

/**
 * Calcula la desviación estándar de un array de valores
 */
function calcularStd(valores) {
  if (valores.length <= 1) return 0;
  const promedio = calcularPromedio(valores);
  const varianza = valores.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) / valores.length;
  return Math.sqrt(varianza);
}

/**
 * Calcula la correlación entre dos arrays de valores
 */
function calcularCorrelacion(x, y) {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
  const sumY2 = y.reduce((acc, val) => acc + val * val, 0);
  
  const numerador = n * sumXY - sumX * sumY;
  const denominador = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominador === 0) return 0;
  return numerador / denominador;
}

/**
 * Calcula el vector de progreso para cada alumno
 */
function calcularVectorProgreso(data) {
  const vectorIdeal = [100.0, 100.0, 100.0];
  
  return data.map(row => {
    const vectorAlumno = [
      row.promedio_gral_calificacion || 0,
      row.promedio_gral_asistencia || 0,
      row.promedio_gral_conducta || 0
    ];
    
    // Calcular la magnitud de la diferencia
    const diferencia = vectorIdeal.map((val, idx) => val - vectorAlumno[idx]);
    const magnitud = Math.sqrt(diferencia.reduce((acc, val) => acc + val * val, 0));
    
    return {
      ...row,
      vector_magnitud: parseFloat(magnitud.toFixed(3))
    };
  });
}

/**
 * Genera recomendaciones pedagógicas basadas en los indicadores
 */
function generarRecomendacion(row) {
  const { probabilidad_riesgo, vector_magnitud, promedio_gral_calificacion, area_de_progreso } = row;
  
  if (probabilidad_riesgo > 0.70) {
    return `🚨 RIESGO INMINENTE (${(probabilidad_riesgo * 100).toFixed(1)}%). Acciones: Plan de Intervención Urgente, Contacto familiar, Tutoría focalizada en materias de bajo rendimiento.`;
  }
  
  if (vector_magnitud > 30 && promedio_gral_calificacion < 75) {
    return "⚠️ DESVIACIÓN CRÍTICA. El alumno está lejos del estándar ideal. Acciones: Identificar la debilidad principal (Asistencia/Conducta) y reforzar de manera prioritaria.";
  }
  
  if (promedio_gral_calificacion >= 80 && area_de_progreso < 75) {
    return "✨ RENDIMIENTO INCONSTANTE. Buen resultado, pero posible inestabilidad. Acciones: Implementar seguimiento diario de tareas y enfocar en la consistencia.";
  }
  
  if (promedio_gral_calificacion > 90 && vector_magnitud < 10) {
    return "💎 EXCELENCIA. Rendimiento y consistencia ejemplares. Acciones: Asignar proyectos de enriquecimiento, considerar tutoría para compañeros con bajo rendimiento.";
  }
  
  return "✅ SEGUIMIENTO RUTINARIO. Desempeño aceptable. Acciones: Refuerzo en áreas específicas con calificación más baja y monitoreo semanal.";
}

/**
 * Función principal que ejecuta el análisis completo
 */
function runAnalysisLogic(data) {
  try {
    // 1. Normalizar columnas
    let processedData = normalizeColumns(data);
    
    // 2. Verificar columnas faltantes
    const primeraFila = processedData[0];
    const columnasPresentes = Object.keys(primeraFila);
    const columnasFaltantes = EXPECTED_COLUMNS.filter(col => !columnasPresentes.includes(col));
    
    if (columnasFaltantes.length > 0 && columnasFaltantes.length < EXPECTED_COLUMNS.length) {
      console.warn(`⚠️ Algunas columnas esperadas no están presentes: ${columnasFaltantes.slice(0, 3).join(', ')}`);
    }
    
    // 3. Calcular promedios generales
    processedData = processedData.map((row, index) => {
      // Obtener todas las columnas de calificación
      const calificaciones = Object.keys(row)
        .filter(key => key.includes('cal_'))
        .map(key => parseFloat(row[key]))
        .filter(val => !isNaN(val));
      
      const promedio_gral_calificacion = calcularPromedio(calificaciones);
      const promedio_gral_asistencia = parseFloat(row.asistencia_gral) || 0;
      const promedio_gral_conducta = parseFloat(row.conducta_gral) || 0;
      
      return {
        ...row,
        id: index + 1,
        promedio_gral_calificacion: parseFloat(promedio_gral_calificacion.toFixed(2)),
        promedio_gral_asistencia: parseFloat(promedio_gral_asistencia.toFixed(2)),
        promedio_gral_conducta: parseFloat(promedio_gral_conducta.toFixed(2))
      };
    });
    
    // 4. Predicción de riesgo (simulación simplificada)
    processedData = processedData.map((row, index) => {
      // Simulación: los primeros 5 tienen alto riesgo
      const riesgo = index < 5 ? 1 : 0;
      const probabilidad = Math.random() * 0.5 + 0.2; // Entre 0.2 y 0.7
      
      return {
        ...row,
        riesgo,
        probabilidad_riesgo: parseFloat(probabilidad.toFixed(3))
      };
    });
    
    // 5. Calcular vector de progreso
    processedData = calcularVectorProgreso(processedData);
    
    // 6. Calcular área de progreso
    processedData = processedData.map(row => ({
      ...row,
      area_de_progreso: parseFloat(
        (row.promedio_gral_calificacion * (row.promedio_gral_asistencia / 100)).toFixed(3)
      ),
      asistencia_pct: row.promedio_gral_asistencia,
      conducta_pct: row.promedio_gral_conducta
    }));
    
    // 7. Generar recomendaciones
    processedData = processedData.map(row => ({
      ...row,
      recomendacion_pedagogica: generarRecomendacion(row),
      materia_critica_temprana: 'Matematicas' // Simplificado
    }));
    
    // 8. Calcular métricas grupales
    const promedios = processedData.map(r => r.promedio_gral_calificacion);
    const asistencias = processedData.map(r => r.promedio_gral_asistencia);
    const conductas = processedData.map(r => r.promedio_gral_conducta);
    
    const promedio_general = calcularPromedio(promedios);
    const area_de_progreso_grupo = promedio_general * processedData.length * 0.9;
    
    const corr_asis = calcularCorrelacion(asistencias, promedios);
    const corr_cond = calcularCorrelacion(conductas, promedios);
    
    return {
      df_procesado: processedData,
      promedio_general: parseFloat(promedio_general.toFixed(2)),
      area_de_progreso_grupo: parseFloat(area_de_progreso_grupo.toFixed(2)),
      correlaciones: {
        asistencia_vs_calificacion: isNaN(corr_asis) ? 0 : parseFloat(corr_asis.toFixed(3)),
        conducta_vs_calificacion: isNaN(corr_cond) ? 0 : parseFloat(corr_cond.toFixed(3))
      },
      estadistica_grupal: {
        std_promedio: parseFloat(calcularStd(promedios).toFixed(3)),
        std_asistencia: parseFloat(calcularStd(asistencias).toFixed(3)),
        std_conducta: parseFloat(calcularStd(conductas).toFixed(3))
      }
    };
    
  } catch (error) {
    console.error('Error en el análisis:', error);
    throw error;
  }
}

module.exports = {
  runAnalysisLogic,
  MATERIAS,
  TEMAS_PARCIALES,
  EXPECTED_COLUMNS
};
