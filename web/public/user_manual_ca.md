# Manual d'Usuari

Aquest manual explica com utilitzar Baby Growth Chart, una aplicació web per visualitzar i calcular percentils de creixement basats en els [Estàndards de Creixement Infantil de l'OMS](https://www.who.int/tools/child-growth-standards/standards) per a infants de 0 a 5 anys.

## Introducció

L'aplicació ofereix tres seccions principals, accessibles des de la barra lateral (o la navegació superior al mòbil):

1. **Calculadora** — Calcula percentils de creixement per a pes, alçada i perímetre cranial simultàniament.
2. **Evolució** — Visualitza el creixement al llarg del temps amb gràfics interactius usant dades carregades o historial guardat.
3. **Manual d'Usuari** — Aquesta pàgina.

Pots canviar el **sexe** (Nens o Nenes), l'**idioma** (anglès, castellà, català) i el **tema** (clar o fosc) en qualsevol moment. El selector de **mètrica** (Pes, Alçada, Perímetre Cranial) només es mostra a la pàgina d'Evolució, ja que la Calculadora sempre mostra les tres mesures. Els ajustos no es mostren en aquesta pàgina.

## Perfils de Nadó

Pots crear perfils per a un o més nadons des de la barra lateral (o el selector de perfil al mòbil):

1. Fes clic a **"Afegir nadó"** i introdueix el nom del nadó.
2. Selecciona el perfil actiu fent clic — s'usa per guardar i recuperar l'historial de mesures.
3. Pots crear múltiples perfils (ex. per a bessons) i canviar entre ells.
4. Elimina un perfil fent clic a la icona de paperera al costat.
5. Al mòbil, usa el **desplegable de perfil** a la barra d'ajustos per canviar entre perfils.

## Calculadora

La Calculadora et permet saber en quin percentil de l'OMS es troben les mesures del teu nadó.

1. **Tria el mètode d'entrada d'edat** fent clic al selector desplegable: data de naixement (es guarda automàticament), edat en dies o edat en mesos.
2. **Introdueix una o més mesures** — pes (kg), alçada (cm) i/o perímetre cranial (cm). Els tres camps sempre estan visibles; omple els que tinguis.
3. **Prem Calcular.** Els resultats mostren:
   - Una **barra de zona** per a cada mesura amb un marcador que indica on es troba el teu nadó (colors: verd = normal, groc = baix/alt, vermell = molt baix/molt alt).
   - El **valor del percentil** ressaltat en negreta dins d'un text descriptiu que explica el seu significat.
   - Una **etiqueta d'interpretació** (ex. "Dins del rang normal", "Per sota de la mitjana").
   - Un **missatge resum** amb una avaluació general del creixement del teu nadó.
   - L'**edat** del nadó en mesos i dies.
4. **Guardar** — Si tens un perfil de nadó actiu, fes clic al botó Guardar. Se't demanarà confirmar la data de la mesura abans de guardar-la.
5. **Compartir** — Fes clic al botó Compartir per compartir els resultats per WhatsApp, email o altres apps (al mòbil), o copiar al portapapers (a l'escriptori).
6. **Exportar** — Fes clic al botó Exportar per descarregar el resultat com a imatge PNG.

### Historial de Mesures

Sota els resultats, una secció desplegable d'**Historial de Mesures** mostra totes les mesures guardades del perfil actiu en una taula:

- Consulta la data, edat, pes, alçada i perímetre cranial de cada mesura guardada.
- **Edita** una mesura fent clic a la icona del llapis — la fila es converteix en editable.
- **Elimina** una mesura fent clic a la icona de paperera.

## Evolució

La pàgina d'Evolució mostra gràfics interactius Plotly amb les corbes de percentils de l'OMS (P01, P25, P50, P75, P99) per a la mètrica i sexe seleccionats.

### Font de dades

Pots triar entre dues fonts de dades:

- **Fitxer Excel** — Puja el teu propi fitxer `.xlsx` amb mesures.
- **Historial guardat** — Usa les mesures guardades des de la Calculadora (requereix un perfil de nadó actiu amb mesures guardades). Es selecciona automàticament quan hi ha historial disponible.

### Pujar les teves dades

1. Fes clic a l'àrea de **Pujar** o arrossega i deixa anar el teu fitxer.
2. El gràfic mostrarà les dades del teu nadó com una línia de color sobre les corbes de percentils.
3. Apareixerà un segon gràfic mostrant el percentil estimat a cada dia registrat.
4. Per eliminar les dades pujades, fes clic al botó **×** al costat del nom del fitxer.

### Alertes de canvi de percentil

Si el percentil del teu nadó canvia significativament entre mesures (més de 20 punts), l'app mostrarà una alerta:

- Les **baixades** es ressalten en vermell amb una recomanació de consultar amb el teu pediatra.
- Les **pujades** es ressalten en verd.

### Exportar gràfics

Fes clic al botó **"Exportar gràfic"** sobre el gràfic per descarregar-lo com a imatge PNG — útil per compartir amb el teu pediatra o família. Al mòbil, girar a mode horitzontal et dona una vista del gràfic a pantalla completa.

### Descarregar la plantilla

Si encara no tens un fitxer Excel, fes clic a **"Descarregar plantilla"** per obtenir un fitxer `.xlsx` pre-omplert amb el format correcte i dades d'exemple. Després pots reemplaçar els valors d'exemple amb les mesures reals del teu nadó.

### Format del fitxer Excel

El teu fitxer Excel ha de tenir aquestes **4 columnes** com a capçaleres a la primera fila:

| Columna | Descripció | Exemple |
|---------|------------|---------|
| `day` | Edat en dies (des del naixement) | 0, 30, 60, 90... |
| `w` | Pes en kg | 3.2, 4.5, 5.8... |
| `h` | Alçada en cm | 50, 54, 58... |
| `hc` | Perímetre cranial en cm | 35, 37, 39... |

**Consells:**

- Els noms de columna han de ser **exactament** com es mostra a dalt (minúscules).
- Pots deixar cel·les buides si no tens aquesta mesura — els buits s'interpolaran linealment.
- Usa punt (`.`) en lloc de coma (`,`) per a decimals.
- Les dades han d'estar al **primer full** del fitxer Excel.

### Exemple

| day | w    | h  | hc |
|-----|------|----|----|
| 0   | 3.2  | 50 | 35 |
| 30  | 4.1  | 54 | 37 |
| 60  | 5.0  | 58 | 39 |
| 90  | 5.8  | 61 | 40 |

## Ajustos

- **Mètrica:** Pes, Alçada o Perímetre Cranial — canvia el gràfic de la pàgina Evolució. La Calculadora sempre mostra les tres.
- **Sexe:** Nens o Nenes — les corbes de creixement de l'OMS difereixen segons el sexe.
- **Perfil de nadó:** Crea i gestiona perfils per als teus nadons. Selecciona el perfil actiu per guardar i recuperar mesures.
- **Idioma:** Anglès, castellà o català.
- **Tema:** Mode clar o fosc, es canvia des de la cantonada superior dreta.

## Avís Mèdic

Aquesta eina és només per a **fins informatius**. Per a qualsevol preocupació sobre el creixement del teu nadó, consulta amb un pediatra o professional de la salut. Les dades de percentils provenen dels Estàndards de Creixement Infantil de l'OMS.
