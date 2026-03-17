# TODO - Baby Growth Chart

## Pendents (feedback María - ronda 3)

1. **Al canviar de perfil en mòbil, no canvia el sexe** - Si es selecciona un perfil amb sexe diferent al dropdown mòbil, el gender toggle no s'actualitza. Al sidebar funciona perquè crida `handleSelectProfile` que fa `setGender`, però al mòbil el select també ho fa — cal verificar que el `onChange` del select mòbil cridi `handleSelectProfile` correctament.

2. **Formulari de creació de perfil hauria de preguntar el sexe** - Ara crea sempre amb el sexe seleccionat globalment. Seria més intuïtiu que el formulari inclogui un selector de sexe (Nen/Nena) directament.

3. **Alertes de canvi de percentil a la Calculadora sense títol** - A Evolució surt "Canvi de percentil detectat" amb icona, però a la Calculadora les alertes apareixen sense títol. Cal afegir el títol amb icona per consistència.

4. **Compartir imatge PNG en lloc de text pla** - El botó "Compartir" copia text pla que es veu malament a WhatsApp. Seria millor compartir directament la imatge PNG generada amb `navigator.share({ files: [...] })`.

5. **Notes a cada mesura** - Permetre afegir notes a cada entrada de l'historial: "Revisió 9 mesos", "Després d'estar malalt", etc. Camp opcional al guardar i editable a la taula d'historial.

6. **Historial en format targeta al mòbil** - La taula té masses columnes i cal fer scroll horitzontal. En mòbil podria ser format targeta (card) en lloc de taula per millorar la llegibilitat.
