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

## 20201130

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

### Retro

* Peter hatte Probleme einzusteigen.
* Schwer an alten Stand anzuknüpfen. ~ 20'
* Code Tausch hat gut funktioniert.
* Jeder 2x dran gewesen.
* 3 Ideen ausprobiert. Gut.
* Intensiv.
