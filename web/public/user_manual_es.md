# Manual de Usuario

Este manual explica cómo usar Baby Growth Chart, una aplicación web para visualizar y calcular percentiles de crecimiento basados en los [Estándares de Crecimiento Infantil de la OMS](https://www.who.int/tools/child-growth-standards/standards) para niños de 0 a 5 años.

## Introducción

La aplicación ofrece tres secciones principales, accesibles desde la barra lateral (o la navegación superior en móvil):

1. **Calculadora** — Calcula percentiles de crecimiento para peso, altura y perímetro craneal simultáneamente.
2. **Evolución** — Visualiza el crecimiento a lo largo del tiempo con gráficos interactivos usando datos cargados o historial guardado.
3. **Manual de Usuario** — Esta página.

Puedes cambiar el **sexo** (Niños o Niñas), el **idioma** (inglés, español, catalán) y el **tema** (claro u oscuro) en cualquier momento. El selector de **métrica** (Peso, Altura, Perímetro Craneal) solo se muestra en la página de Evolución, ya que la Calculadora siempre muestra las tres medidas. Los ajustes no se muestran en esta página.

## Perfiles de Bebé

Puedes crear perfiles para uno o más bebés desde la barra lateral (o el selector de perfil en móvil):

1. Haz clic en **"Añadir bebé"** e introduce el nombre del bebé.
2. Selecciona el perfil activo haciendo clic en él — se usa para guardar y recuperar el historial de medidas.
3. Puedes crear múltiples perfiles (ej. para gemelos) y cambiar entre ellos.
4. Elimina un perfil haciendo clic en el icono de papelera junto a él.
5. En móvil, usa el **desplegable de perfil** en la barra de ajustes para cambiar entre perfiles.

## Calculadora

La Calculadora te permite saber en qué percentil de la OMS se encuentran las medidas de tu bebé.

1. **Elige el método de entrada de edad** haciendo clic en el selector desplegable: fecha de nacimiento (se guarda automáticamente), edad en días o edad en meses.
2. **Introduce una o más medidas** — peso (kg), altura (cm) y/o perímetro craneal (cm). Los tres campos siempre están visibles; rellena los que tengas.
3. **Pulsa Calcular.** Los resultados muestran:
   - Una **barra de zona** para cada medida con un marcador que indica dónde se encuentra tu bebé (colores: verde = normal, amarillo = bajo/alto, rojo = muy bajo/muy alto).
   - El **valor del percentil** resaltado en negrita dentro de un texto descriptivo que explica su significado.
   - Una **etiqueta de interpretación** (ej. "Dentro del rango normal", "Por debajo de la media").
   - Un **mensaje resumen** con una evaluación general del crecimiento de tu bebé.
   - La **edad** del bebé en meses y días.
4. **Guardar** — Si tienes un perfil de bebé activo, haz clic en el botón Guardar. Se te pedirá confirmar la fecha de la medida antes de guardarla.
5. **Compartir** — Haz clic en el botón Compartir para compartir los resultados por WhatsApp, email u otras apps (en móvil), o copiar al portapapeles (en escritorio).
6. **Exportar** — Haz clic en el botón Exportar para descargar el resultado como imagen PNG.

### Historial de Medidas

Debajo de los resultados, una sección desplegable de **Historial de Medidas** muestra todas las medidas guardadas del perfil activo en una tabla:

- Consulta la fecha, edad, peso, altura y perímetro craneal de cada medida guardada.
- **Edita** una medida haciendo clic en el icono del lápiz — la fila se convierte en editable.
- **Elimina** una medida haciendo clic en el icono de papelera.

## Evolución

La página de Evolución muestra gráficos interactivos Plotly con las curvas de percentiles de la OMS (P01, P25, P50, P75, P99) para la métrica y sexo seleccionados.

### Fuente de datos

Puedes elegir entre dos fuentes de datos:

- **Archivo Excel** — Sube tu propio archivo `.xlsx` con medidas.
- **Historial guardado** — Usa las medidas guardadas desde la Calculadora (requiere un perfil de bebé activo con medidas guardadas). Se selecciona automáticamente cuando hay historial disponible.

### Subir tus datos

1. Haz clic en el área de **Subir** o arrastra y suelta tu archivo.
2. El gráfico mostrará los datos de tu bebé como una línea de color sobre las curvas de percentiles.
3. Aparecerá un segundo gráfico mostrando el percentil estimado en cada día registrado.
4. Para eliminar los datos subidos, haz clic en el botón **×** junto al nombre del archivo.

### Alertas de cambio de percentil

Si el percentil de tu bebé cambia significativamente entre medidas (más de 20 puntos), la app mostrará una alerta:

- Las **bajadas** se resaltan en rojo con una recomendación de consultar con tu pediatra.
- Las **subidas** se resaltan en verde.

### Exportar gráficos

Haz clic en el botón **"Exportar gráfico"** sobre el gráfico para descargarlo como imagen PNG — útil para compartir con tu pediatra o familia. En móvil, girar a modo horizontal te da una vista del gráfico a pantalla completa.

### Descargar la plantilla

Si aún no tienes un archivo Excel, haz clic en **"Descargar plantilla"** para obtener un archivo `.xlsx` pre-rellenado con el formato correcto y datos de ejemplo. Luego puedes reemplazar los valores de ejemplo con las medidas reales de tu bebé.

### Formato del archivo Excel

Tu archivo Excel debe tener estas **4 columnas** como cabeceras en la primera fila:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `day` | Edad en días (desde el nacimiento) | 0, 30, 60, 90... |
| `w` | Peso en kg | 3.2, 4.5, 5.8... |
| `h` | Altura en cm | 50, 54, 58... |
| `hc` | Perímetro craneal en cm | 35, 37, 39... |

**Consejos:**

- Los nombres de columna deben ser **exactamente** como se muestra arriba (minúsculas).
- Puedes dejar celdas vacías si no tienes esa medida — los huecos se interpolarán linealmente.
- Usa punto (`.`) en lugar de coma (`,`) para decimales.
- Los datos deben estar en la **primera hoja** del archivo Excel.

### Ejemplo

| day | w    | h  | hc |
|-----|------|----|----|
| 0   | 3.2  | 50 | 35 |
| 30  | 4.1  | 54 | 37 |
| 60  | 5.0  | 58 | 39 |
| 90  | 5.8  | 61 | 40 |

## Ajustes

- **Métrica:** Peso, Altura o Perímetro Craneal — cambia el gráfico de la página Evolución. La Calculadora siempre muestra las tres.
- **Sexo:** Niños o Niñas — las curvas de crecimiento de la OMS difieren según el sexo.
- **Perfil de bebé:** Crea y gestiona perfiles para tus bebés. Selecciona el perfil activo para guardar y recuperar medidas.
- **Idioma:** Inglés, español o catalán.
- **Tema:** Modo claro u oscuro, se cambia desde la esquina superior derecha.

## Aviso Médico

Esta herramienta es solo para **fines informativos**. Para cualquier preocupación sobre el crecimiento de tu bebé, consulta con un pediatra o profesional de la salud. Los datos de percentiles provienen de los Estándares de Crecimiento Infantil de la OMS.
