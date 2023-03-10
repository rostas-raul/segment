<img src="./.github/logo.svg" width="80" align="right">

> **Warning**  
> A projekt aktív fejlesztés alatt áll.  
> Egyes funkciók nem működhetnek vagy nincsenek megcsinálva.  

# segment
A segment egy decentralizált kommunikációs platform, amely más hasonló platformokhoz képest könnyebb és gyorsabb.

A projekt egyszerűbb módját választja a kommunikáció kezelésének azáltal, hogy nem bonyolítja túl a funkciókat, és inkább a kommunikálni kívánó emberek bizalmára támaszkodik.

**[Videó Bemutató](https://github.com/rostas-raul/segment/raw/main/.github/video.mp4)**

## Használat

### Felhasználói Szerver
A szerver futtatásához:
```
$ cd segment-server/
$ npm run start
```

A szerver építéséhez:
```
$ cd segment-server/
$ npm run build
```

<sub>További parancsok a `package.json` fájlban megtalálhatóak.</sub>

### Kliens Applikáció
A futtatáshoz:
```
$ cd segment-app/
$ npm run dev
```

## Teendők Listája
- [ ] Kommunikáció egy felhasználói szerveren belül
  - [X] Szöveg alapú kommunikáció
  - [ ] Hang és videó alapú kommunikáció
- [ ] Kommunikáció felhasználói szerverek között
  - [ ] Szöveg alapú kommunikáció
  - [ ] Hang és videó alapú kommunikáció
- [ ] Képek és fájlok feldolgozása és tárolása
- [ ] A [Signal Protocol](https://signal.org/docs/) implementálása
- [ ] Testreszabható felhasználói profilok
- [ ] Applikáció testreszabása CSS és JavaScript használatával
