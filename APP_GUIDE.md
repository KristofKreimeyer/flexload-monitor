# FlexLoad Monitor App-Leitfaden

Diese Datei erklärt, wo du nachschauen musst, wenn du verstehen möchtest, was die App macht.

## Was diese App ist

FlexLoad Monitor ist eine Phoenix-Webanwendung, die ein synthetisches Energie-Monitoring-Dashboard bereitstellt. Die Daten kommen aktuell noch nicht von echten Sensoren oder aus einer Datenbank. Sie werden in Elixir erzeugt, an eine Inertia/Vue-Seite übergeben und dort als KPI-Karten, Lasttrend-Diagramm, Stadtteilkarte, Detailbereich für Stadtteile, Statusfilter und Alarmvorschauen dargestellt.

## Request-Ablauf

1. Ein Browser ruft `/dashboard` auf.
2. [router.ex](lib/flexload_monitor_web/router.ex) schickt den Request durch die Browser-Pipeline.
3. [page_controller.ex](lib/flexload_monitor_web/controllers/page_controller.ex) ruft `FlexloadMonitor.Energy.dashboard_data/0` auf.
4. [energy.ex](lib/flexload_monitor/energy.ex) baut das synthetische Dashboard-Payload.
5. Inertia sendet dieses Payload an die Frontend-Seite mit dem Namen `Dashboard`.
6. [app.ts](assets/js/app.ts) ordnet `Dashboard` der Datei [Dashboard.ts](assets/js/pages/Dashboard.ts) zu.
7. Das Vue-Dashboard rendert die Daten mit Komponenten aus [assets/js/components](assets/js/components).

Der Refresh-Button folgt einem ähnlichen Ablauf, ruft aber `/dashboard/data` auf. Diese Route liefert dasselbe Dashboard-Payload als JSON zurück, statt die Inertia-Seite zu rendern.

## Backend-Dateien

[lib/flexload_monitor/application.ex](lib/flexload_monitor/application.ex)

Startet den OTP-Supervision-Tree. Hier startet Phoenix den Endpoint, das Datenbank-Repo, PubSub, Telemetrie und DNS-Clustering.

[lib/flexload_monitor_web/endpoint.ex](lib/flexload_monitor_web/endpoint.ex)

Definiert den HTTP-Endpoint. Requests laufen durch statische Dateiauslieferung, Parser, Sessions, Telemetrie und am Ende durch den Router.

[lib/flexload_monitor_web/router.ex](lib/flexload_monitor_web/router.ex)

Definiert öffentliche Routen:

- `/` rendert die standardmäßige Phoenix-Startseite.
- `/dashboard` rendert das Inertia/Vue-Dashboard.
- `/dashboard/data` gibt das Dashboard-JSON zurück, das vom Refresh-Button verwendet wird.

[lib/flexload_monitor_web/controllers/page_controller.ex](lib/flexload_monitor_web/controllers/page_controller.ex)

Verbindet Routen mit Responses. Diesen Controller solltest du zuerst lesen, wenn du wissen möchtest, was jede URL zurückgibt.

[lib/flexload_monitor/energy.ex](lib/flexload_monitor/energy.ex)

Die aktuelle Domain- und Datenquelle. Diese Datei enthält feste Stadtteildaten, feste Alarmdaten, generierte 24-Stunden-Messwerte und aggregierte KPIs. Wenn du später echte APIs oder Datenbanktabellen anschließt, ist dies wahrscheinlich das Modul, das du ersetzt oder erweiterst.

[lib/flexload_monitor_web.ex](lib/flexload_monitor_web.ex)

Gemeinsame Phoenix-Verdrahtung. Controller, HTML-Module, Channels und Route-Helpers bekommen ihre gemeinsamen Imports von hier.

[lib/flexload_monitor_web/telemetry.ex](lib/flexload_monitor_web/telemetry.ex)

Definiert Phoenix-, Datenbank- und VM-Metriken. Diese sind später nützlich, wenn du Monitoring oder Reporter ergänzt.

## Frontend-Dateien

[assets/js/app.ts](assets/js/app.ts)

Startet die Inertia/Vue-Anwendung. Diese Datei ordnet vom Server gerenderte Inertia-Seitennamen den tatsächlichen TypeScript-Modulen zu.

[assets/js/pages/Dashboard.ts](assets/js/pages/Dashboard.ts)

Die zentrale Dashboard-Seite. Sie verwaltet den aktuellen Dashboard-Snapshot, den ausgewählten Statusfilter, den ausgewählten Stadtteil, den Ladezustand beim Aktualisieren und die Zusammensetzung aller Dashboard-Komponenten.

[assets/js/domain/types.ts](assets/js/domain/types.ts)

Frontend-TypeScript-Verträge für Stadtteile, Alarme, Messwerte und KPIs. Diese Datenformen müssen zu dem passen, was `FlexloadMonitor.Energy` zurückgibt.

[assets/js/components/KpiCard.ts](assets/js/components/KpiCard.ts)

Rendert eine KPI-Karte mit Status-Styling.

[assets/js/components/LoadTrendChart.ts](assets/js/components/LoadTrendChart.ts)

Rendert das ECharts-Liniendiagramm sowie eine zugängliche Zusammenfassung und Statistiken für Last und PV-Erzeugung.

[assets/js/components/DistrictMap.ts](assets/js/components/DistrictMap.ts)

Lädt Leaflet bei Bedarf, rendert Stadtteil-Marker und zeigt eine Fallback-Statusliste.

[assets/js/components/StatusFilter.ts](assets/js/components/StatusFilter.ts)

Ermöglicht dem Dashboard, Stadtteile nach Status zu filtern.

[assets/js/components/DistrictDetailPanel.ts](assets/js/components/DistrictDetailPanel.ts)

Zeigt Detailmetriken für den ausgewählten Stadtteil.

[assets/js/components/AlertPreviewList.ts](assets/js/components/AlertPreviewList.ts)

Sortiert Alarme nach Zeitstempel und rendert die neuesten Alarmvorschauen.

## Datenstruktur

Das Dashboard-Payload hat vier Top-Level-Keys:

- `districts`: fiktive Stadtteile mit Status, Koordinaten, aktueller Last, PV-Erzeugung, Wärmepumpen und EV-Ladepunkten.
- `measurements`: generierte aggregierte 24-Stunden-Messwerte für das Diagramm.
- `alerts`: fiktive Betriebsalarme.
- `kpis`: Summen und Statuszählungen, die als KPI-Karten angezeigt werden.

Das Backend verwendet camelCase-Keys, weil das Frontend das Payload direkt als JavaScript-Daten verwendet.

## Wo du Dinge änderst

Wenn du die angezeigten Daten ändern möchtest, beginne in [energy.ex](lib/flexload_monitor/energy.ex).

Wenn du Routen hinzufügen oder ändern möchtest, beginne in [router.ex](lib/flexload_monitor_web/router.ex) und aktualisiere danach [page_controller.ex](lib/flexload_monitor_web/controllers/page_controller.ex).

Wenn du das Dashboard-Layout ändern möchtest, beginne in [Dashboard.ts](assets/js/pages/Dashboard.ts).

Wenn du ein einzelnes Widget ändern möchtest, bearbeite die passende Datei in [assets/js/components](assets/js/components).

Wenn du gemeinsam genutzte Frontend-Datentypen ändern möchtest, aktualisiere [types.ts](assets/js/domain/types.ts) und stelle sicher, dass das Backend-Payload weiterhin dazu passt.

## Ausführen und Prüfen

Verwende die üblichen Phoenix-Befehle:

```bash
mix setup
mix phx.server
```

Öffne danach:

- `http://localhost:4000/`
- `http://localhost:4000/dashboard`
- `http://localhost:4000/dashboard/data`

Bevor du Änderungen committest, führe aus:

```bash
mix precommit
```
