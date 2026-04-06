# TODO - Baby Growth Chart

## Pendents (feedback María - ronda 3)

1. ~~**Al canviar de perfil en mòbil, no canvia el sexe**~~ — ✅ Resolt: el sexe s'aplica des del perfil actiu.

2. ~~**Formulari de creació de perfil hauria de preguntar el sexe**~~ — ✅ Resolt: el formulari ara inclou selector Nen/Nena.

3. **Alertes de canvi de percentil a la Calculadora sense títol** - A Evolució surt "Canvi de percentil detectat" amb icona, però a la Calculadora les alertes apareixen sense títol. Cal afegir el títol amb icona per consistència.

4. **Compartir imatge PNG en lloc de text pla** - El botó "Compartir" copia text pla que es veu malament a WhatsApp. Seria millor compartir directament la imatge PNG generada amb `navigator.share({ files: [...] })`.

5. **Notes a cada mesura** - Permetre afegir notes a cada entrada de l'historial: "Revisió 9 mesos", "Després d'estar malalt", etc. Camp opcional al guardar i editable a la taula d'historial.

6. **Historial en format targeta al mòbil** - La taula té masses columnes i cal fer scroll horitzontal. En mòbil podria ser format targeta (card) en lloc de taula per millorar la llegibilitat.

## Neteja tècnica (post-redesign)

7. **Eliminar CSS mort (~30 classes)** - Classes huèrfanes de dissenys anteriors: `.interpretation-*`, `.zone-bar-*`, `.chart-card-*`, `.mini-gauge-*`, `.metric-card-*`, `.medical-disclaimer`, `.github-signature`, `.tip-card`, `.result-stats-row`, `.history-toggle`, `.history-card`, `.btn-export-history`, `.data-source`, `.measurements-row`, `.evo-alerts-title`, `.history-status`, `.percentile-scale-status`, `.result-profile-name`.

8. **Corregir variable shadowing a Evolution.jsx** - `data` local a `downloadTemplate()` fa ombra al prop `data`. `r` a `Calculator.jsx` fa ombra a la variable externa. No causa bugs però dificulta manteniment.

9. **Afegir dependencies faltants a useEffect (Evolution.jsx)** - L'efecte de línia ~158 llegeix `hasHistory`, `babyData` i `dataSource` però només declara `[activeProfileId]`. Funciona per disseny però genera warnings de lint.

10. **Base `display: none` per `.mobile-bottom-nav`** - Ara només s'amaga via media query `min-width: 769px`. Afegir `display: none` com a estil base per evitar flash d'estil a desktop.
