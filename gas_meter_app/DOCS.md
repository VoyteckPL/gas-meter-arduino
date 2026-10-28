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
| **Zużycie** | statystyki z faktur: zużycie i koszt miesięczne i roczne, profil sezonowy, import faktur z eBOK |
| **Bateria** | historia napięcia z prognozą, prognoza żywotności, pojemność, test rozładowania, powiadomienia, statystyki dla nerdów |
| **Ustawienia** | parametry gazomierza (odstęp wysyłki, debounce, impulsy na m³, kalibracja i progi baterii) oraz **Ustaw stan licznika** |
| **Sieć** | aktualne IP, MAC, sieć WiFi i punkt dostępu, stałe IP i ustawienia WiFi |
| **Serwis** | tryb serwisowy, restart, aktualizacja firmware, diagnostyka (liczniki, obudzenia, czas pracy, powód restartu) |
| **Demo** | symulator gazomierza i ESP32, działa w przeglądarce i nie potrzebuje danych z gazomierza |

**Gesty na telefonie:** przesunięcie palcem w lewo lub w prawo przełącza zakładki. Na wykresie jeden palec przewija stronę,
dwa palce powiększają i przesuwają wykres, dotknięcie pokazuje wartość, a pasek przeglądu pod wykresem przesuwa okno jednym palcem.

Mała pomarańczowa liczba przy zakładce oznacza, ile poleceń czeka, aż gazomierz je odbierze. Ostatnio użyta zakładka jest zapamiętywana.

## Faktury i zużycie

Zakładka **Zużycie → Faktury z eBOK**: zaloguj się w eBOK (sam, apka nie zna hasła), otwórz stronę „Faktury”, zaznacz tabelę,
skopiuj i wklej w polu. **Podgląd** pokazuje, co zostało rozpoznane, a **Importuj faktury** zapisuje je w apce (te same numery są
aktualizowane, więc możesz wklejać ponownie co kilka miesięcy). Dane zostają tylko w apce.

Faktura jest przypisana do miesiąca poprzedzającego termin płatności, więc miesięczne wartości to przybliżenie. Zużycie z faktur jest
w kWh. Przeliczenie na m³ używa współczynnika kWh na m³. Gdy apka ma historię stanu licznika z tych samych miesięcy
(po imporcie z Home Assistant albo z samego gazomierza), sama podpowiada współczynnik, a przycisk **Użyj** go zapisuje.

### Integracja Orlen gas sensor

Gdy w Home Assistant działa integracja **Orlen gas sensor** ([pawelhulek/pgnig-sensor](https://github.com/pawelhulek/pgnig-sensor), instalacja przez HACS,
logowanie przez Orlen ID z kodem SMS robi ona sama), apka znajduje jej encje i:

* dopisuje **nowe faktury** z prawdziwym zużyciem w m³ i kWh (wtedy współczynnik kWh/m³ pochodzi z faktur),
* porównuje **odczyt zapisany w eBOK** z naszym gazomierzem z tego samego dnia,
* sprawdza to co 15 minut i na przycisku **Pobierz teraz** w karcie „Połączenie z Orlen”.

Integracja udostępnia tylko ostatnią fakturę i ostatni odczyt, więc starsze faktury wklejasz raz z tabeli (powyżej).

## Import historii z Home Assistant

Jeśli w Home Assistant masz już historię gazomierza (np. ze starego czujnika), możesz ją dołączyć do apki, żeby wykresy i statystyki
były ciągłe. Zakładka **Serwis → Historia z Home Assistant**:

1. Wybierz encję ze statystykami długoterminowymi (pole „Szukaj” filtruje listę). Rodzaj (stan licznika w m³ albo napięcie baterii w V)
   ustawia się według jednostki encji.
2. Kliknij **Podgląd**: zobaczysz zakres dat, liczbę punktów, pierwszą i ostatnią wartość. Dobra encja licznika ma ostatnią wartość
   bliską aktualnemu stanowi gazomierza i zero pominiętych spadków.
3. Kliknij **Importuj** i potwierdź. Jeśli encja liczy w impulsach, wpisz najpierw dzielnik (impulsów na m³).

Zaimportowana historia jest tylko starsza niż pierwszy odczyt z nowego gazomierza. Nic się nie zmienia w Home Assistant, a przycisk
**Usuń zaimportowane** cofa import. Dla każdego rodzaju (licznik, bateria) trzymana jest jedna zaimportowana encja. Uwaga: stary szkic
mierzył napięcie baterii błędnie, więc zaimportowane napięcie może być zawyżone (sprawdź zakres w podglądzie).

## Wykresy

Kliknij kafelek w Przeglądzie (albo wartość w teście baterii), żeby zobaczyć jego historię. Wykres jest interaktywny:

* **przeciągnij** (komputer) albo **dwoma palcami** (telefon), żeby przewijać w czasie,
* **kółko myszy** (albo szczypanie dwoma palcami, albo przyciski +/−) powiększa i pomniejsza,
* **dwuklik** (albo przycisk ⟲) pokazuje cały zakres,
* **pasek na dole** to przegląd całej historii: przesuwaj w nim okno albo jego krawędzie,
* przyciski zakresów (1 godz. … Wszystko) ustawiają widoczny okres,
* po najechaniu (lub dotknięciu) widać dokładną wartość i czas, a pod wykresem minimum, maksimum i średnią z widocznego okresu.

## Zabezpieczenia

Akcje, które mogą zaszkodzić gazomierzowi albo odczytom, wymagają potwierdzenia w oknie z opisem skutków:
restart, aktualizacja firmware, tryb serwisowy, stałe IP i ustawienia sieci, stan licznika oraz parametry pomiaru i baterii.
Okno pokazuje, co dokładnie się zmieni, a przy akcjach niebezpiecznych przycisk potwierdzenia aktywuje się dopiero po chwili.
Anuluj, klawisz Esc albo kliknięcie w tło zamykają okno bez wysyłania polecenia.

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
* **Ostrzeżenie**, gdy do napięcia zatrzymania WiFi (3,00 V) zostaje mniej niż `battery_warn_days` dni, powtarzane co 7 dni.
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

## Pogoda a zużycie (zakładka Zużycie)

Apka pobiera dobowe średnie temperatury z archiwum Open-Meteo (darmowe, bez klucza). Wysyłane są wyłącznie współrzędne zaokrąglone do ok. 1 km,
domyślnie z lokalizacji ustawionej w Home Assistancie; można je zmienić w karcie „Pogoda a zużycie". Temperatury są zapisywane w `/data/weather.json`.
Na ich podstawie liczone są stopniodni grzewcze (suma różnic poniżej 15,5 °C) i model „zużycie = stałe + współczynnik × stopniodni"
dopasowany do miesięcy z faktur. Daje to prognozę na 12 miesięcy i porównanie sezonów grzewczych (m³ na 1000 stopniodni). Potrzeba co najmniej 6 miesięcy z fakturami.

## Panel Energia

Karta „Panel Energia w Home Assistant” (zakładka Zużycie) wysyła statystykę `gas_meter_app:gas_history` w m³. Potem w Ustawienia → Pulpity → Energia
dodaj źródło gazu i wybierz „Gazomierz (z historią)”. Nie dodawaj obok niego drugiej encji gazomierza, bo zużycie zliczy się podwójnie.
Faktury sprzed odczytów są rozłożone równo na godziny miesiąca, więc widok godzinowy i dzienny dla tamtego okresu jest uśredniony.

## Encje obliczane przez apkę

Oprócz encji z gazomierza (m³, napięcie, %, WiFi) apka publikuje przez MQTT discovery sześć własnych, odświeżanych co 10 minut:
`Bateria (szacunek)`, `Czas pracy baterii`, `Naładuj baterię do`, `Prognoza najbliższej faktury`, `Prognoza rachunków 12 miesięcy` i `Zużycie gazu w miesiącu (prognoza)`.
Prognozy zależą od zaimportowanych faktur, a bateria od historii napięcia; bez nich encje po prostu nie dostają wartości.
