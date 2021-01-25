# Sessions

Constraint "Tell Don't Ask"

* "strict", everything is void, no returns.
* Follow the function (callback) calls.
* "brutal", even more strict: no callbacks with internal state. (Cheating).
* Es ist extrem, wo führt das hin?

## 20201107 Coderetreat

* 45'
* Klaus: Gezwungen stärker zu überlegen, wer welchen State hat.
* Peter: Interessant, wo kommt man hin wenn nur da sind Functions?

### Steps

* 1. start rules
* Test gelassen weil nicht TDA relevant.
* 2. what is callback for rules -> `Cell.update`
* 3. where do neighbours come from (für die Rules) -> `Grid`
* 4. what is callback of countNeighboursAt, who gets the answer?

## 20201130 Session 2

* 2h
* weiter an 3.

### Currying

* Super Spielerei mit Currying.
* TODO Can we use currying on TDA?
* Type inference macht es praktikabel.
* `_eachCell(_getCellState(_ifCellAlive(_inc)))(this);`
* lesbar wäre es.
* `_getCellState` is cheating
* Hatte kein Ziel...
* Peter hätte navigieren sollen statt tippen...

### Noch Mehr

* Wir konnten technische Schwierigkeit lösen, in JS kein Problem.
* Verschärfte Version hat es schön gelöst, Code gelöscht. Besser.
* `this.eachAliveCell(_inc);`

### Retro 2

* Peter hatte Probleme einzusteigen.
* Schwer an alten Stand anzuknüpfen. ~ 20'
* Code Tausch hat gut funktioniert.
* Jeder 2x dran gewesen.
* 3 Ideen ausprobiert. Gut.
* Intensiv.

## 20201221 Session 3

* 2.5h
* weiter an 4. = alles zusammen setzen

### TDA 3

* `executeIf` is Feature Envy?
* wenn wir Zugriff auf Data hineinverschieben wird es einfacher.
* Rows und Columns spannend
* Müssen keine Callbacks machen, können einfach das Ziel mitgeben.
* Wenn wir dem "Nachgeben", dann würden wir nur 1 Klasse haben.
* TODO Alle callbacks prüfen ob wir sie brauchen? Wir sind zu schnell.
* Vielleicht ist das Bottom Up schlecht, weil wir dadurch viel Callbacks
  bauen: "ich brauche die Nachbarn", nein, ich brauche dass Nachbarn einen
  Count erhöhen.
* Ist Bottom Up schlecht für TDA? Oder überhaupt, weil ich baue kleine generische
  Utils und stecke sie dann zusammen. Outside-in scheint mehr TDA zu unterstützen
  weil ich auch von aussen komme = Call.
* Die `Row`s und `Column`s sind bei Outside-in aufgekommen, wie ich `Print` machen
  wollte.

### Retro 3

* schneller hineinkommen als letztes Mal.
* Der nächste Schritt war nicht vorbereitet.
* Parallel Change in kleinen Schriten.
* War flüssig, guter Fortschritt.
* Weil wir GoL kennen können wir Rules hinschreiben in 1 Minute.
* Wir sind stark in unseren Mustern, weil wir Problem kennen? Weil wir schon
  Lösungsmuster haben.

## 20210125 Session 4

* 2h
* bug in tick - State vergessen
* letzte Callbacks entfernt.

### TDA 4

* Copy ist irgendwie standard. Aber mit TDA geht es nicht gut.
* Ist `copy` gegen die Natur von TDA?
* Memento ist eine andere Methode und befolt Kapselung.
* Counter Objeckt statt Callback bei Nachbar zählen => weniger Callback, weniger generisch, mehr Kopplung
* Tests behindern uns beim groben Umstrukturieren.
* Wir entfernen Callbacks und erhöhen Kopplung auf konkrete Typen.
* Benannte konkrete Functions fühlen sich besser an als anonymer Callback.
* Callback eingeführt um zu testen, stört beim Refactoring.
* Brauchen bei den Tests viele Mocks.
* Wieder Callback entfernt weil Code und Daten zusammen gekommen sind.
* Daten die Entwscheidung treffen haben die Entscheidung geteilt.

### Fragen

* Hat TDD uns am Anfang viele Callbacks erzeugt?
  * Wir haben beim Refactoren Tests verloren?!
* Hätten wir mit echten Mocks anfangen können?
* Hätten wir outside-in anfangen sollen?

### Retro 4

* Roter Test hilft schneller zum Reinkommen.
* Zu wenig gewechselt?
* 3 grössere Sachen gemacht.
* Peter artikuliert Ziel als Navigator, manchmal detailliert.
* Gemschmeidig. Flow.
* 2 Ideen die es deutlich einfacher/direkter gemacht haben, spannend.
* Immer Umwege bis die schöne Lösung da war. Basierend auf Gefühl...

### Learnings

* 8 Stunden
* Wir denken wenig über Verantwortlichkeit von Daten.
* Bottom up schwer. In 4. Session noch geändert.
* Wäre outside-in besser? Passt das besser zu TDA und OO?
* Bottom up ist ca. functional, ich bauen Functions und compose.
* Es geht nicht nur um void, es geht um State verstecken.
* Challenge: Koordinate?
* Am Anfang hat es Funktional ausgesehen. (CPS Style)
* Am Ende stark OO, "keine Argumente" ausser Coordinaten.
