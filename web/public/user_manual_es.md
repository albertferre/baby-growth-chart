# Manual de Usuario

Este manual explica cómo usar Baby Growth Chart, una aplicación web para visualizar y calcular percentiles de crecimiento basados en los [Estándares de Crecimiento Infantil de la OMS](https://www.who.int/tools/child-growth-standards/standards) para niños de 0 a 5 años.

## Introducción

La aplicación ofrece tres secciones principales, accesibles desde la barra de navegación superior (o la barra inferior en móvil):

1. **Calculadora** — Calcula percentiles de crecimiento para peso, altura y perímetro craneal simultáneamente.
2. **Evolución** — Visualiza el crecimiento a lo largo del tiempo con gráficos interactivos usando datos cargados o historial guardado.
3. **Manual de Usuario** — Esta página.

Puedes cambiar el **idioma** (inglés, español, catalán) en cualquier momento desde el selector de idioma en la barra superior.

## Perfiles de Bebé

Puedes crear y gestionar perfiles para uno o más bebés desde el selector de perfil en la barra superior:

1. Haz clic en el selector de perfil y pulsa **"Añadir bebé"**. Introduce el nombre y selecciona el sexo (niño o niña).
2. Selecciona el perfil activo haciendo clic en él — se usa para guardar y recuperar el historial de medidas, y el sexo se aplica automáticamente a los cálculos.
3. Puedes crear múltiples perfiles (ej. para gemelos) y cambiar entre ellos.
4. **Edita** un perfil haciendo clic en el icono del lápiz para cambiar el nombre o el sexo.
5. **Elimina** un perfil haciendo clic en el icono de papelera.

Cuando hay un perfil activo, el selector de sexo no aparece en la calculadora ya que se usa el del perfil. Si no hay perfil, puedes seleccionar el sexo directamente en el formulario de nueva medida.

## Calculadora

La Calculadora te permite saber en qué percentil de la OMS se encuentran las medidas de tu bebé.

1. **Elige el método de entrada de edad** usando las pestañas: fecha de nacimiento (se guarda automáticamente), edad en días o edad en meses.
2. **Introduce una o más medidas** — peso (kg), altura (cm) y/o perímetro craneal (cm). Rellena los que tengas.
3. **Pulsa Calcular.** Los resultados muestran:
   - Una **barra de progreso** para cada medida con un indicador de zona (normal, bajo, alto, etc.).
   - El **valor del percentil** en formato grande.
   - Una **etiqueta de estado** con icono indicando la zona.
4. **Guardar** — Si tienes un perfil activo, haz clic en el botón Guardar debajo de los resultados. Se te pedirá confirmar la fecha de la medida.
5. **Crear perfil** — Si no tienes perfil activo, aparecerá un botón para crear uno y poder guardar las medidas.
6. **Compartir / Exportar** — Usa los botones debajo de los resultados para compartir o descargar como imagen PNG.

### Hitos Próximos

Si tienes una fecha de nacimiento configurada, la calculadora muestra los próximos hitos pediátricos (revisiones, alimentación, desarrollo motor) con enlaces a las fuentes oficiales.

### Historial de Medidas

Haciendo clic en una medida del historial reciente se abre un **diálogo modal** con todas las medidas guardadas del perfil activo:

- Consulta la fecha, edad (en meses o años), peso, altura, perímetro craneal y percentiles.
- **Edita** una medida haciendo clic en el icono del lápiz.
- **Elimina** una medida haciendo clic en el icono de papelera.

### Historial Reciente

En la parte inferior derecha de la calculadora se muestran las últimas 3 medidas con todas las métricas registradas (ej. "8.2kg · 72cm · HC 45cm").

## Evolución

La página de Evolución muestra gráficos interactivos con la línea del **Promedio OMS** (percentil 50) y bandas sombreadas para los percentiles P1-P99 y P25-P75.

### Registrar Medidas

Haz clic en el botón **"Registrar Peso"** (o Altura / Perímetro según la métrica seleccionada) para añadir rápidamente una nueva medida. Se abrirá una ventana donde introduces el valor y la fecha (por defecto la fecha actual). Si no tienes perfil activo, el botón te permitirá crear uno.

### Fuente de datos

Puedes elegir entre dos fuentes:

- **Historial guardado** — Usa las medidas guardadas desde la Calculadora. Se selecciona automáticamente cuando hay historial disponible.
- **Archivo Excel** — Sube tu propio archivo `.xlsx` con medidas.

### Gráfico de Crecimiento

El gráfico muestra:
- **Línea azul sólida**: Promedio OMS (percentil 50).
- **Banda azul oscura**: Rango P25-P75 (zona normal).
- **Banda azul clara**: Rango P1-P99 (zona amplia).
- **Línea del bebé**: Las medidas de tu bebé superpuestas.

El eje X muestra la edad en meses, con "Nacimiento" como punto de inicio.

### Alertas

En la columna derecha se muestran alertas si:
- El **percentil actual** es bajo o muy bajo.
- Ha habido un **cambio significativo** de percentil entre medidas (subida o bajada de 20 puntos o más).

### Exportar gráficos

Haz clic en **"Exportar gráfico"** para descargarlo como imagen PNG.

### Formato del archivo Excel

Tu archivo Excel debe tener estas **4 columnas** como cabeceras:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `day` | Edad en días (desde el nacimiento) | 0, 30, 60, 90... |
| `w` | Peso en kg | 3.2, 4.5, 5.8... |
| `h` | Altura en cm | 50, 54, 58... |
| `hc` | Perímetro craneal en cm | 35, 37, 39... |

**Consejos:**

- Los nombres de columna deben ser **exactamente** como se muestra (minúsculas).
- Puedes dejar celdas vacías — los huecos se interpolan linealmente.
- Usa punto (`.`) para decimales.
- Los datos deben estar en la **primera hoja** del archivo.

## Fuentes de Datos

Las fuentes utilizadas para los hitos y estándares están enlazadas en el pie de página:

- **WHO Child Growth Standards** — Curvas de percentiles de peso, altura y perímetro craneal.
- **AAP Bright Futures** — Calendario de revisiones pediátricas.
- **WHO Infant Feeding Guidelines** — Hitos de alimentación.
- **WHO Motor Development Study** — Hitos de desarrollo motor.

## Aviso Médico

Esta herramienta es solo para **fines informativos**. Para cualquier preocupación sobre el crecimiento de tu bebé, consulta con un pediatra o profesional de la salud.
