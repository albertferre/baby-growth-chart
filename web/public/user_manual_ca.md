# Manual d'Usuari

Aquest manual explica com utilitzar Baby Growth Chart, una aplicació web per visualitzar i calcular percentils de creixement basats en els [Estàndards de Creixement Infantil de l'OMS](https://www.who.int/tools/child-growth-standards/standards) per a infants de 0 a 5 anys.

## Introducció

L'aplicació té tres seccions principals, accessibles des de la barra de navegació superior (o la barra inferior al mòbil):

1. **Calculadora** — Calcula percentils de creixement per a pes, alçada i perímetre cranial simultàniament.
2. **Evolució** — Visualitza el creixement al llarg del temps amb gràfics interactius usant dades carregades o historial guardat.
3. **Manual d'Usuari** — Aquesta pàgina.

Pots canviar l'**idioma** (anglès, castellà, català) en qualsevol moment des del selector d'idioma a la barra superior.

## Perfils de Nadó

Pots crear i gestionar perfils per a un o més nadons des del selector de perfil a la barra superior:

1. Fes clic al selector de perfil i prem **"Afegir nadó"**. Introdueix el nom i selecciona el sexe (nen o nena).
2. Selecciona el perfil actiu fent clic sobre ell — s'utilitza per guardar i recuperar l'historial de mesures, i el sexe s'aplica automàticament als càlculs.
3. Pots crear múltiples perfils (p. ex. per a bessons) i canviar entre ells.
4. **Edita** un perfil fent clic a la icona del llapis per canviar el nom o el sexe.
5. **Elimina** un perfil fent clic a la icona de la paperera.

Quan hi ha un perfil actiu, el selector de sexe no apareix a la calculadora ja que s'utilitza el del perfil. Sense perfil, pots seleccionar el sexe directament al formulari de nova mesura.

## Calculadora

La Calculadora et permet saber en quin percentil de l'OMS es troben les mesures del teu nadó.

1. **Tria el mètode d'entrada d'edat** usant les pestanyes: data de naixement (es guarda automàticament), edat en dies o edat en mesos.
2. **Introdueix una o més mesures** — pes (kg), alçada (cm) i/o perímetre cranial (cm). Omple els que tinguis.
3. **Prem Calcular.** Els resultats mostren:
   - Una **barra de progrés** per a cada mesura amb un indicador de zona (normal, baix, alt, etc.).
   - El **valor del percentil** en format gran.
   - Una **etiqueta d'estat** amb icona indicant la zona.
4. **Guardar** — Si tens un perfil actiu, fes clic al botó Guardar sota els resultats. Se't demanarà confirmar la data de la mesura.
5. **Crear perfil** — Si no tens perfil actiu, apareixerà un botó per crear-ne un i poder guardar les mesures.
6. **Compartir / Exportar** — Usa els botons sota els resultats per compartir o descarregar com a imatge PNG.

### Pròximes Fites

Si tens una data de naixement configurada, la calculadora mostra les pròximes fites pediàtriques (revisions, alimentació, desenvolupament motor) amb enllaços a les fonts oficials.

### Historial de Mesures

Fent clic en una mesura de l'historial recent s'obre un **diàleg modal** amb totes les mesures guardades del perfil actiu:

- Consulta la data, edat (en mesos o anys), pes, alçada, perímetre cranial i percentils.
- **Edita** una mesura fent clic a la icona del llapis.
- **Elimina** una mesura fent clic a la icona de la paperera.

### Historial Recent

A la part inferior dreta de la calculadora es mostren les últimes 3 mesures amb totes les mètriques registrades (p. ex. "8.2kg · 72cm · HC 45cm").

## Evolució

La pàgina d'Evolució mostra gràfics interactius amb la línia de la **Mitjana OMS** (percentil 50) i bandes ombrejades per als percentils P1-P99 i P25-P75.

### Registrar Mesures

Fes clic al botó **"Registrar Pes"** (o Alçada / Perímetre segons la mètrica seleccionada) per afegir ràpidament una nova mesura. S'obrirà una finestra on introdueixes el valor i la data (per defecte la data actual). Si no tens perfil actiu, el botó et permetrà crear-ne un.

### Font de dades

Pots triar entre dues fonts:

- **Historial guardat** — Utilitza les mesures guardades des de la Calculadora. Es selecciona automàticament quan hi ha historial disponible.
- **Fitxer Excel** — Puja el teu propi fitxer `.xlsx` amb mesures.

### Gràfic de Creixement

El gràfic mostra:
- **Línia blava sòlida**: Mitjana OMS (percentil 50).
- **Banda blava fosca**: Rang P25-P75 (zona normal).
- **Banda blava clara**: Rang P1-P99 (zona àmplia).
- **Línia del nadó**: Les mesures del teu nadó superposades.

L'eix X mostra l'edat en mesos, amb "Naixement" com a punt d'inici.

### Alertes

A la columna dreta es mostren alertes si:
- El **percentil actual** és baix o molt baix.
- Hi ha hagut un **canvi significatiu** de percentil entre mesures (pujada o baixada de 20 punts o més).

### Exportar gràfics

Fes clic a **"Exportar gràfic"** per descarregar-lo com a imatge PNG.

### Format del fitxer Excel

El teu fitxer Excel ha de tenir aquestes **4 columnes** com a capçaleres:

| Columna | Descripció | Exemple |
|---------|------------|---------|
| `day` | Edat en dies (des del naixement) | 0, 30, 60, 90... |
| `w` | Pes en kg | 3.2, 4.5, 5.8... |
| `h` | Alçada en cm | 50, 54, 58... |
| `hc` | Perímetre cranial en cm | 35, 37, 39... |

**Consells:**

- Els noms de columna han de ser **exactament** com es mostra (minúscules).
- Pots deixar cel·les buides — els buits s'interpolen linealment.
- Usa punt (`.`) per a decimals.
- Les dades han d'estar al **primer full** del fitxer.

## Fonts de Dades

Les fonts utilitzades per a les fites i estàndards estan enllaçades al peu de pàgina:

- **WHO Child Growth Standards** — Corbes de percentils de pes, alçada i perímetre cranial.
- **AAP Bright Futures** — Calendari de revisions pediàtriques.
- **WHO Infant Feeding Guidelines** — Fites d'alimentació.
- **WHO Motor Development Study** — Fites de desenvolupament motor.

## Avís Mèdic

Aquesta eina és només per a **fins informatius**. Per a qualsevol preocupació sobre el creixement del teu nadó, consulta amb un pediatra o professional de la salut.
