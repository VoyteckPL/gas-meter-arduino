# Energia Gazomierz

Panel w pasku bocznym Home Assistant dla gazomierza na baterii (ESP32, kontaktron, MQTT; firmware w tym repozytorium).
Pokazuje odczyty, historię i baterię z prognozą żywotności, pozwala zmieniać ustawienia gazomierza i wysyła powiadomienia o baterii.
Tworzy też zwykłe encje Home Assistant (stan licznika w m³, bateria, sygnał WiFi), więc gazomierz można dodać do panelu Energia.

Styl interfejsu i logo nawiązują do ORLEN. Aplikacja jest nieoficjalna i nie ma związku z PKN ORLEN. Nazwa i znak ORLEN należą do ich właściciela.

## Instalacja

1. W Home Assistant otwórz **Ustawienia → Dodatki → Sklep z dodatkami**.
2. Menu **⋮** (prawy górny róg) → **Repozytoria** i dodaj `https://github.com/VoyteckPL/gas-meter-arduino`.
3. Znajdź **Energia Gazomierz**, kliknij **Zainstaluj**, **Uruchom** i włącz **Pokaż na pasku bocznym**.
4. Otwórz **Energia Gazomierz** z paska bocznego.

## Połączenie MQTT

* Jeśli masz dodatek **Mosquitto broker**, apka użyje go automatycznie.
* W przeciwnym razie w zakładce **Konfiguracja** apki wpisz `mqtt_host`, `mqtt_port`, `mqtt_user` i `mqtt_password`
  (ten sam broker, do którego publikuje gazomierz).

Dane logowania przechowuje Home Assistant, nie to repozytorium.

## Zakładki

| Zakładka | Zawartość |
|---|---|
| **Przegląd** | stan licznika, przepływ, zużycie dziś, bateria, sygnał WiFi, wykres zużycia. Kliknij kafelek, żeby zobaczyć historię |
| **Bateria** | historia napięcia z prognozą, prognoza żywotności, pojemność, test rozładowania, powiadomienia, statystyki dla nerdów |
| **Ustawienia** | parametry gazomierza (odstęp wysyłki, debounce, impulsy na m³, kalibracja i progi baterii) oraz **Ustaw stan licznika** |
| **Sieć** | aktualne IP, MAC, sieć WiFi i punkt dostępu, stałe IP i ustawienia WiFi |
| **Serwis** | tryb serwisowy, restart, aktualizacja firmware, diagnostyka (liczniki, obudzenia, czas pracy, powód restartu) |
| **Demo** | symulator gazomierza i ESP32, działa w przeglądarce i nie potrzebuje danych z gazomierza |

Mała pomarańczowa liczba przy zakładce oznacza, ile poleceń czeka, aż gazomierz je odbierze. Ostatnio użyta zakładka jest zapamiętywana.

## Zakładka Bateria

Pokazuje historię napięcia z prognozą i dwie niezależne prognozy żywotności:

* **Model zużycia**: pozostały ładunek podzielony przez średni prąd wyliczony z tego, co gazomierz naprawdę robi
  (sesje WiFi na dobę, ok. 0,04 mAh na sesję, sen 50 µA, samorozładowanie 1,5% na miesiąc). Działa od pierwszego dnia.
* **Trend napięcia**: prosta poprowadzona przez stan naładowania z ostatnich 7 dni i przedłużona do napięcia odcięcia.
  Jest zmierzony, ale ustala się wolno, bo ogniwo Li-ion ma płaską krzywą napięcia na górze.

Gdy oba wyniki się zgadzają, można im ufać.

Pojemność użyta w obu to liczba ogniw razy pojemność jednego ogniwa razy użyteczna część. Wpisz prąd pobierany podczas testu rozładowania
(zmierzony multimetrem szeregowo z baterią) i liczbę ogniw w teście, a panel policzy prawdziwą pojemność Twojego ogniwa
(prąd razy czas do rozładowania), zapisze ją i użyje zamiast wartości katalogowej. Gdy test dojdzie do 3,0 V, panel uczy się też
prawdziwej krzywej napięcie → naładowanie i używa jej dla gazomierza.

## Powiadomienia

Apka obserwuje baterię i wysyła wiadomości przez Home Assistant (powiadomienie w dzwonku oraz, po wybraniu odbiorców, push na telefon):

* **Raport** (co tydzień albo co miesiąc, pierwszy zaraz po pierwszych danych): naładowanie, napięcie, szacunkowa żywotność z modelu
  i z trendu oraz data, do której warto naładować. Data jest liczona z ostrożniejszej z dwóch prognoz.
* **Ostrzeżenie**, gdy do napięcia zatrzymania WiFi (3,10 V) zostaje mniej niż `battery_warn_days` dni, powtarzane co 7 dni.
  Poniżej `battery_critical_days` komunikat jest mocniejszy i wraca co 2 dni. Napięcia 3,50 V / 3,30 V wywołują te same ostrzeżenia,
  nawet gdy prognozy brakuje.
* **Naładowano**, gdy napięcie wzrosło o 0,25 V po ostrzeżeniu (to też kasuje ostrzeżenie).
* **Alarm ciszy**, gdy przez `silent_alert_hours` godzin nie przychodzą dane (pusta bateria albo zgubione WiFi).

**Wybór odbiorców:** w zakładce **Bateria**, karta *Powiadomienia*, panel pokazuje osoby z Twojego Home Assistant razem z ich telefonami
(z aplikacją Home Assistant Companion) oraz inne telefony, które nie należą do żadnej osoby. Zaznacz tych, którzy mają dostawać wiadomości.
Wybór zapamiętuje apka. Jeśli telefonu nie ma na liście, zainstaluj aplikację Companion, zaloguj się i kliknij *Odśwież*.

Przyciski w karcie pozwalają od razu wysłać wiadomość testową albo raport. Apka potrzebuje dostępu do API Home Assistant
(`homeassistant_api`), HA nadaje go przy aktualizacji.

## Opcje

| Opcja | Domyślnie | Znaczenie |
|---|---|---|
| `mqtt_host`, `mqtt_port`, `mqtt_user`, `mqtt_password` | puste | broker; zostaw puste, żeby użyć dodatku Mosquitto |
| `root_topic` | `Gaz/Gazomierz` | musi być taki sam jak `ROOT_TOPIC` w firmware |
| `battery_test_topic` | `Gaz/BatteryTest` | temat szkicu `battery_test`, pokazuje kartę i wykres testu rozładowania (puste = wyłączone) |
| `battery_preset` | `NCR18650GA` | typ ogniw (pojemność z danych katalogowych) albo `custom` |
| `battery_cells` | `2` | liczba ogniw **równolegle** |
| `battery_cell_mah` | `3000` | pojemność jednego ogniwa, tylko przy `custom` |
| `battery_usable_pct` | `85` | użyteczna część pojemności z etykiety (odcięcie 3,0 V, zimno, starzenie, ogniwa poniżej etykiety) |
| `notify_service` | puste | opcjonalnie jedna dodatkowa usługa powiadomień, np. `notify.mobile_app_twoj_telefon`. Zwykle odbiorców wybierasz w zakładce Bateria |
| `notify_persistent` | `true` | dodatkowo twórz powiadomienie w dzwonku Home Assistant |
| `battery_report` | `monthly` | raport o baterii: `off`, `weekly` lub `monthly` |
| `battery_warn_days` | `45` | ostrzegaj, gdy do napięcia zatrzymania WiFi zostaje mniej dni |
| `battery_critical_days` | `14` | mocniejsze ostrzeżenie poniżej tylu dni |
| `silent_alert_hours` | `48` | alarm, gdy gazomierz nic nie wysyła przez tyle godzin (0 = wyłączone) |
| `publish_discovery` | `true` | utwórz encje Home Assistant (stan licznika, bateria, sygnał) |
| `language` | `auto` | nieużywane, apka jest tylko po polsku |

## Jak panel rozmawia z gazomierzem

Gazomierz śpi prawie cały czas. Ustawienia odczytuje tylko podczas sesji WiFi, która zdarza się, gdy płynie gaz (ogrzewanie albo ciepła woda)
oraz co kilka godzin przy raporcie statusowym. Dlatego:

* Zmiana jest zapisywana na brokerze jako **polecenie retained** (`<root>/set/<nazwa>`). Panel pokazuje
  **„czeka na gazomierz”**, dopóki gazomierz jej nie odczyta i nie wyczyści.
* Żeby gazomierz odebrał zmiany szybko, włącz **tryb serwisowy** i odkręć na chwilę ciepłą wodę albo ogrzewanie.
  Gazomierz zostaje wtedy obudzony, dopóki nie wyłączysz trybu serwisowego.
* Oczekujące polecenia można anulować przyciskiem **anuluj**.

Ustawienia, tryb serwisowy, aktualizacja firmware i zmiana sieci wymagają firmware etapu 2 (patrz README repozytorium).
Odczyty i **Ustaw stan licznika** działają z obecnym firmware.

## Uwagi

* Hasło WiFi wpisane w sekcji Sieć przechodzi przez broker MQTT, dopóki gazomierz go nie zastosuje i nie wyczyści. Używaj prywatnego brokera.
  Panel nigdy nie pokazuje hasła.
* Historia (stan licznika, bateria, sygnał) jest zapisywana w katalogu danych apki i przeżywa restarty oraz aktualizacje.
  Baterię, sygnał i liczniki sesji trzymamy ok. roku (jedna próbka na 15 minut).
* Logo w pasku nagłówka to `static/logo.png`, ikona apki to `icon.png`, a obraz w sklepie z dodatkami to `logo.png`. Możesz je podmienić na własne pliki o tych nazwach.
