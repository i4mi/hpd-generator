# HPD Testdaten-Generator
Der HPD Testdaten-Generator ist ein Tool, das wir im Auftrag von eHealth Suisse (Kontakt: Maurice Zysset) erstellt und erweitert haben. Die laufende Version ist unter in einem Github Repo auf Pagesde ployed und unter https://i4mi.github.io/hpd-generator/ verfügbar.

## Deployment 
Der HPD-Testgenerator wird über Github Pages gehostet. Dafür gibt es ein privates [privates Github Repo](https://github.com/i4mi/hpd-generator). Die Pipeline ist so konfiguriert, dass beim Commit auf den `main`-Branch ein Build erstellt und unter https://i4mi.github.io/hpd-generator/ bereitgestellt wird.
Wichtig ist dabei, dass die Dateien im `.github/`-Ordner erhalten bleiben. Ebenso muss in `vite.config.js` die Base URL korrekt gesetzt sein:
```javascript
export default defineConfig({
  base: '/hpd-generator/',
  /// ...
})
```
Schlussendlich ist es wichtig, dass das `npm run build` Skript korrekt funktioniert.
 
### Deployment alt
Zuerst war das Deployment wie folgt implementiert, allerdings funktioniert public.medinflab.ti.bfh.ch seit Ende 08/2024 nicht mehr. Der Vollständigkeit halber bleibt die alte Dokumentation hier erhalten:
- Die Gitlab-Pipeline erstellt automatisch einen Docker-Container, wenn ein Commit auf Gitlab gepusht wird. Die Konfiguration des Docker Files ist im [Dockerfile](./Dockerfile) vorzunehmen.
- Wenn die Pipeline erfolgreich gelaufen ist, kann das Docker File in den [Portainer vom Medinf Labor](https://portainer.medinflab.ti.bfh.ch/#!/1/docker/containers/76def5f610343831defa9aa59ef0dbe70e26abfc584166f5dcd0ffa82ecefe98) gepullt werden, um die gehostete Version zu aktualisieren. Die Zugangsdaten für den Portainer befinden sich im [Passbolt](https://password.ti.bfh.ch).
  - Um ein neues Image zu laden, kann man den aktuell laufenden Container stoppen (Actions -> stop). Dann kann man den Container neu pullen (Actions -> Dublicate/Edit und dann "Deploy the container", im Idealfall ohne weitere Änderungen). 

## Versionen
### Version 1
Simpler Vue-Client, mit Datengererierung auf dem Server (express.js). Erstellt von Robin Glauser, 2021, im Auftrag von eHealth Suisse.

### Version 2
Erweiterung der früheren Version zur besser konfigurierbaren Datenerstellung, ausgelegt für höhere Datenmengen. Aus technischen und Performance-Gründen wurde die Datengenerierung in die Vue Webapp verlagert (mit Webworkern, um das GUI während der Generierung nicht zu blockieren). Hauptsächlich geschrieben durch Gabriel Hess, 2024.

## Vue Entwicklung / mit Vite
Nach dem Auschecken des Repository kann man mit 

```sh
npm install
```

die Abhängigkeiten installieren.

```sh
npm run dev
```
Startet einen Entwicklungsserver, der mit Hot Reload ein schnelles lokales Entwickeln ermöglicht. In der Standardkonfiguration ist dieser Entwicklungsserver unter [localhost, Port 5173](http://localhost:5173/) erreichbar.

Um eine Produktions-Version der Webapp zu erstellen, kann diese mit 
```sh
npm run build
``` 
gebildet werden. Dies ist allerdings im Normalfall auf dem lokalen Rechner nicht nötig, da es über die Gitlab Pipeline geschieht (siehe Kapitel Deployment).
