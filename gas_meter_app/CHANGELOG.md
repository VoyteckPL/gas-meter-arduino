# Changelog

## 0.27.0

* Historia gazu: odczyty encji są teraz brane z pola „suma” statystyk (liczy dalej mimo zerowania licznika źródła), a z pola „stan” tylko gdy suma nie jest dostępna. Przy każdej encji na liście widać, z którego pola czytała apka, ile ma godzin, przerw w danych i odrzuconych spadków licznika.
* Przerwy w danych (brak odczytów dłużej niż 36 godzin, także między dwiema encjami) są wypisane z datami i oznaczone jako „luka w danych”. Dni w przerwach trafiają na listę podejrzanych i można je uzupełnić typowym zużyciem razem z pustymi dniami.
* Nowa sekcja „Wyrównanie do faktur”: miesiące z historii obok zużycia z faktur, przycisk „Wyrównaj” dla jednego miesiąca albo wszystkich, które różnią się o więcej niż 3 %. Dni miesiąca są skalowane do sumy z faktury z zachowaniem rozkładu zużycia, ręczne poprawki dni zostają. Wyrównanie można cofnąć. Działa też dla miesięcy bez danych (zużycie z faktury rozkłada się równo).
* Historia o innej skali niż licznik (np. suma z encji zamiast stanu) jest przesuwana do pierwszego odczytu gazomierza, więc nie ma skoku na styku.

## 0.26.1

* Po wgraniu historii do encji apka pyta Home Assistanta, czy statystyki encji są widoczne, i pokazuje ich liczbę, początek i sumę. Jeśli HA ich nie widzi, pokazuje błąd zamiast sukcesu. Karta wyjaśnia też, gdzie szukać historii: okno encji pokazuje tylko ostatnią dobę, a długą historię widać w panelu Energia, w karcie „Wykres statystyk” i w Narzędzia deweloperskie → Statystyki.

## 0.26.0

* Historia gazu: przycisk „Utwórz encję i wgraj historię” tworzy w Home Assistancie prawdziwą encję „Licznik gazu (z historią)” (jest w rejestrze encji, w urządzeniu Gas meter) i wgrywa do jej statystyk całą scaloną i poprawioną historię. Tę jedną encję wskaż w panelu Energia zamiast starych. Po poprawkach kliknij ponownie, historia encji zostanie zastąpiona. Statystyka zewnętrzna „Gazomierz (z historią)” zostaje jako druga opcja.
* Kliknięcie słupka na wykresie historii otwiera poprawkę tego dnia pod wykresem: wpisujesz zużycie albo wybierasz „Typowe”, możesz też cofnąć poprawkę lub uznać dzień za prawdziwy.
* Jeden palec przesuwany w bok po wykresie przewija wykres (pionowy ruch dalej przewija stronę). Podpowiedź na wykresie historii pokazuje jeden dzień zamiast najbliższych dni z każdego koloru.

## 0.25.0

* Historia gazu: przycisk „Uzupełnij puste dni typowym zużyciem” ustawia wszystkie dni bez zużycia w środku sezonu (na przykład przerwę między dwiema encjami) na typowe zużycie z sąsiednich dni. Wiele pustych dni z rzędu nie zaniża już „typowego” poziomu.
* Poprawki na wszystkich naraz: „Popraw skoki na typowe”, „Popraw wszystkie”, „Uznaj wszystkie za prawdziwe”, a także zaznaczanie dni pól wyboru z przyciskami „Popraw zaznaczone” i „Uznaj zaznaczone”. Przed zmianą apka pokazuje liczbę dni i o ile zmieni się zużycie. „Cofnij wszystkie poprawki” przywraca dane z Home Assistanta.

## 0.24.1

* Przesunięcie palcem w bok po wykresie nie przełącza już zakładki: wykres sam się przewija. Dotyczy wszystkich przewijanych wykresów.
* Historia gazu: poprawka dnia zrobiona na samym podglądzie (przed „Wczytaj i scal”) nie kasuje już podglądu. Podgląd zostaje, a poprawka jest od razu widoczna.

## 0.24.0

* Nowa karta „Historia gazu z Home Assistanta” w zakładce Serwis: wybierasz kilka encji ze statystykami gazu (np. starą od 2019 i nową), a apka składa z nich jedną historię. Najnowsza encja jest wzorcem, starsze są przesuwane tak, żeby odczyty się zszyły; gdy encje się pokrywają, wygrywa nowsza. Karta pokazuje wykres zużycia na dobę w kolorach encji, informację o każdym zszyciu (przerwa, przesunięcie) i listę podejrzanych dni (nagły skok, ponad 6 m³ w godzinę, brak zużycia w środku sezonu).
* Podejrzany dzień możesz poprawić (ustawić zużycie, domyślnie typowe z sąsiednich dni), uznać za prawdziwy albo cofnąć poprawkę. Można też ustawić zużycie dowolnego dnia. Poprawki są zapisane w apce, odczyty liczone są od najnowszego, więc stan licznika dziś się nie zmienia.
* Przycisk „Wyślij scaloną historię do panelu Energia” wysyła wynik jako jedną statystykę „Gazomierz (z historią)”. Wskaż ją w panelu Energia zamiast starych encji, żeby nie liczyć podwójnie. Po każdej poprawce wyślij ją jeszcze raz.
* Stara karta historii służy już tylko do napięcia baterii.

## 0.23.1

* Z apki usunięte wszystkie ustawienia, których firmware nie obsługuje: tryb serwisowy, restart i aktualizacja gazomierza, zmiana parametrów (odstęp wysyłki, debounce, kalibracja baterii i inne) oraz edycja sieci. Gazomierz odbiera z brokera tylko stan licznika, więc reszta tylko wisiała jako „czeka na gazomierz”. Zakładka Ustawienia ma teraz ustawianie stanu licznika, Sieć pokazuje tylko podgląd, a Serwis import historii z Home Assistanta i diagnostykę.

## 0.23.0

* Karta pieca ma widok „Miesiące i sezony”: gaz na ciepłą wodę, ogrzewanie oraz postój i resztę w każdym miesiącu, z udziałem wody w procentach. Podział dni apka zapisuje na stałe, więc historia rośnie, choć Home Assistant trzyma stany pieca tylko około 10 dni.
* Trzy nowe statystyki do panelu Energia: „Gaz – ciepła woda”, „Gaz – ogrzewanie” i „Gaz – postój i reszta”. Razem dają zużycie gazomierza. Przycisk „Wyślij do panelu Energia” wysyła je od pierwszej znanej godziny, potem nowe godziny dopisują się co godzinę.

## 0.22.0

* Nowa karta „Piec: ciepła woda i ogrzewanie” w zakładce Zużycie. Apka czyta stan pieca z encji z Home Assistanta (domyślnie `sensor.ariston_genus_one_status_kotla`, opcja `boiler_entity`) i dzieli gaz na ciepłą wodę, ogrzewanie oraz postój i resztę. Gaz między zmianami stanu bierze z odczytów gazomierza, więc każdy tryb dostaje tyle, ile zużył w swoim czasie trwania. Karta pokazuje słupki na dobę, liczbę cykli, średni czas, gaz i moc kW.
* Apka tylko czyta stan pieca i zapisuje go u siebie, niczego nie wysyła do pieca. Stany `unknown` i `unavailable` są pomijane. Recorder HA trzyma historię około 10 dni, więc starszych miesięcy nie da się podzielić wstecz.

## 0.21.13

* Wykres baterii: przy widoku dłuższym niż około 5 miesięcy każdy miesiąc ma podpis i podziałkę, rok jest przy styczniu i przy pierwszym podpisie, a co drugi miesiąc ma jasne tło. Przy krótkich zakresach (dni, tygodnie) zostają dotychczasowe podpisy godzin i dni.

## 0.21.12

* Model baterii uwzględnia teraz drugie wybudzenie każdego impulsu (przy rozwarciu kontaktronu, bez WiFi, około 0,35 s). Ma własny słupek „Wybudzenia przy rozwarciu” w podziale zużycia energii i wchodzi też do prognozy z sezonami.

## 0.21.11

* Zakładka Bateria odświeża się od razu, gdy gazomierz wyśle nowe napięcie (np. po włożeniu ogniwa). Wcześniej trzeba było odświeżyć stronę (F5) albo czekać do minuty.

## 0.21.10

* Prognoza baterii działa od pierwszego dnia: dopóki nie ma historii licznika i sesji WiFi, liczba impulsów na dobę jest brana z zużycia gazu w tym miesiącu według faktur. Wcześniej przez pierwsze godziny po starcie (albo po wymianie baterii) prognozy były puste.
* Koszt jednej sesji WiFi w modelu: 0,015 mAh (zmierzone około 0,7 s z kluczem WPA w hex i statycznym IP), wcześniej 0,04 mAh. Domyślnie jedna sesja na impuls, bo firmware wysyła każdy impuls.

## 0.21.9

* Zakładka Bateria pokazywała napięcie z historii, która zapisuje jeden punkt na 15 minut, więc nowy odczyt (np. po włożeniu innego ogniwa) pojawiał się dopiero po kwadransie. Teraz „Bateria teraz”, procent i prognozy biorą zawsze najnowszy odczyt.

## 0.21.8

* „Ustaw stan licznika” przyjmuje teraz także **0** (wcześniej pole odrzucało zero).

## 0.21.7

* Test rozładowania zakończony wcześniej niż przy 3,0 V (szkic testowy liczył ze starym współczynnikiem 1,887 zamiast 2,044 i wyłączył się przy faktycznych około 3,25 V): apka przyjmuje taki przebieg, gdy test ma stan „finished”. Brakujący ogon krzywej (kilka procent) bierze z krzywej ogólnej i uwzględnia go w pojemności.
* Szkic `battery_test` ma teraz współczynnik 2,044, tak jak gazomierz.

## 0.21.6

* Odporność na restarty licznika: skoki odczytu, których gazomierz nie mógłby wykonać (powyżej około 8 m³ na godzinę), nie są liczone jako zużycie. Dotyczy panelu Energia, prognozy rachunku i modelu baterii. Przyczyna: stara, zatrzymana wartość retained na brokerze naprzemiennie z nowym licznikiem dawała w danych „zużycie” rzędu 400 m³.

## 0.21.5

* Wykres temperatury i zużycia: oś temperatury jest odwrócona (zimno u góry), więc linia temperatury biegnie zgodnie ze słupkami zużycia (im zimniej, tym więcej gazu). Strefa mrozu (poniżej 0 °C) ma jasnoniebieskie tło, linię zera i oznaczenie ❄.

## 0.21.4

* Progi baterii: zatrzymanie WiFi przy **3,00 V** (było 3,10 V), a hibernacja dopiero przy **2,85 V** (było 3,00 V). Dzięki temu między zatrzymaniem WiFi a hibernacją nadal zostaje zapas, w którym gazomierz liczy impulsy. Zmiana jest w firmware (`BATTERY_STOP_WIFI_V`, `BATTERY_CUTOFF_V`), więc wymaga wgrania szkicu; apka ma już nowe progi w prognozach.

## 0.21.3

* Prognoza w teście rozładowania: przy szybkim rozładowaniu (powyżej 25 % na dobę) trend jest liczony z ostatnich 4 godzin i startuje od prawdziwego naładowania. Wcześniej długi trend wychodził poniżej rzeczywistości, czas do 3,0 V wychodził 0 i linia prognozy w ogóle nie powstawała.

## 0.21.2

* Test rozładowania: wykres od razu pokazuje cały przebieg testu razem z prognozą (wcześniej okno 90 dni było tak szerokie, że prognoza na kilka godzin była niewidoczna).

## 0.21.1

* Zakładka Bateria: osobna karta „Test rozładowania baterii” (drugie to samo napięcie) zniknęła. Szczegóły testu (napięcie na pinie, czas, stan, WiFi, współczynnik dzielnika) są teraz w jednej karcie „Bateria teraz” po wybraniu widoku „Test rozładowania”.

## 0.21.0

* **Procent baterii zawsze na wierzchu:** zakładka Przegląd pokazuje teraz naładowanie z krzywej apki (nauczonej z Twojego testu) razem z szacowanym czasem pracy.
* **Prognoza baterii z sezonami:** model liczy dzień po dniu, ile sesji WiFi będzie w kolejnych miesiącach na podstawie zużycia gazu z faktur. Pokazuje czas do ostrzeżenia i do zatrzymania WiFi, tabelę zużycia baterii miesiąc po miesiącu i fioletową linię prognozy na wykresie.
* **Encje w Home Assistant** (MQTT discovery, urządzenie „Gas meter”), odświeżane co 10 minut: Bateria (szacunek, %), Czas pracy baterii (dni), Naładuj baterię do (data), Prognoza najbliższej faktury (PLN), Prognoza rachunków 12 miesięcy (PLN), Zużycie gazu w miesiącu (prognoza, m³). Nadają się do kafelków i automatyzacji.

## 0.20.0

* **Prognoza rachunku** (zakładka Zużycie): najbliższa faktura z zakresem (zużycie tego miesiąca z odczytów gazomierza do dziś, reszta z modelu pogody),
  suma na następne 12 miesięcy z porównaniem do roku wcześniej oraz tabela kolejnych miesięcy.
* Cena liczona jako opłata stała + cena za kWh, dopasowane do faktur z ostatnich 12 miesięcy.

## 0.19.0

* **Panel Energia:** apka wysyła do Home Assistanta własną statystykę „Gazomierz (z historią)” (`gas_meter_app:gas_history`, m³, z sumą).
  Do pierwszych odczytów gazomierza używa miesięcy z faktur rozłożonych równo na godziny, dalej godzinowych odczytów gazomierza
  (także tych zaimportowanych z Home Assistanta). Jedno źródło gazu w panelu Energia pokazuje więc całą historię.
* Nie zmienia żadnej istniejącej encji. Nowe godziny są dopisywane co godzinę, a statystykę można usunąć przyciskiem w apce.
  Wysyłka i usunięcie wymagają potwierdzenia.

## 0.18.1

* **Miesiące jako bloki:** co drugi miesiąc ma jasne tło, a w porównaniu lat i prognozie dochodzą pionowe podziałki między miesiącami.
* **Mała legenda przy każdym wykresie** (zużycie, historia encji, bateria, porównanie lat, pogoda, wykres punktowy, prognoza): kolor, rodzaj linii lub słupka i co oznacza.

## 0.18.0

* **Porównanie lat:** każdy rok z faktur ma przycisk, który włącza lub ukrywa jego słupki (do 8 lat naraz, każdy rok ma swój kolor), a nie tylko ostatnie 4 lata.
* **Wykres temperatury i zużycia w czasie** jest teraz w pełni interaktywny (przewijanie, kółko i dwa palce do przybliżania, przyciski, pasek przeglądu)
  i ma drugą oś (°C) po prawej. Wykres `TimeChart` obsługuje serie na prawej osi.
* Wykres punktowy (stopniodni a zużycie) i prognoza 12 miesięcy pokazują szczegóły po najechaniu lub dotknięciu.

## 0.17.1

* Karta „Pogoda a zużycie": nowy wykres **temperatury i zużycia w czasie** (słupki z faktur, niebieska linia średniej temperatury miesiąca,
  przerywana linia zużycia przewidywanego przez model). Wykres punktowy dostał opis, co oznaczają osie.

## 0.17.0

* **Pogoda a zużycie:** apka pobiera dobowe temperatury z darmowego archiwum Open-Meteo (bez konta i klucza; wysyła tylko współrzędne
  zaokrąglone do ok. 1 km, domyślnie z lokalizacji Home Assistanta, można je zmienić) i liczy stopniodni grzewcze (poniżej 15,5 °C).
* **Model zużycia:** zużycie miesięczne z faktur = stałe (woda, kuchnia) + współczynnik × stopniodni, z wykresem punktowym i R².
* **Prognoza na 12 miesięcy** przy typowej pogodzie z ostatnich lat oraz tabela **m³ na 1000 stopniodni** dla każdego sezonu grzewczego,
  czyli porównanie lat niezależne od tego, czy zima była zimna.

## 0.16.0

* **Ładniejszy wykres zużycia miesięcznego:** zaokrąglone słupki z gradientem i odstępami, podpisy miesięcy i lat na osi,
  szare tło sezonu grzewczego (październik–kwiecień), przerywana linia średniej z 12 miesięcy, podświetlany słupek pod palcem/myszą
  i tooltip z m³, kWh, kosztem w zł i ceną za kWh.
* **Nowa karta „Porównanie lat”:** ten sam miesiąc z ostatnich 4 lat obok siebie, z tooltipem po najechaniu.

## 0.15.0

* **Połączenie z integracją Orlen gas sensor** (HACS, `pawelhulek/pgnig-sensor`): apka sama znajduje jej encje po atrybutach,
  dopisuje **nowe faktury** (numer, termin, kwota, kWh i **m³**) i zapamiętuje odczyty z eBOK. Logowanie do eBOK (Orlen ID z kodem SMS)
  robi integracja, apka nie zna hasła. Sprawdzanie co 15 minut i przyciskiem „Pobierz teraz”.
* **Prawdziwy współczynnik kWh/m³** z faktur (mediana z faktur, które podają m³) zamiast domyślnych 11,0. Ręczny zapis współczynnika nadal ma pierwszeństwo.
  Zużycie miesięczne w m³ jest brane wprost z faktur, gdy faktura je podaje, a w pozostałych miesiącach przeliczane.
* **Porównanie z Orlenem:** odczyt zapisany w eBOK jest zestawiany ze stanem naszego gazomierza z tego samego dnia (różnica w m³).
* Faktura dopisana przez integrację nie dubluje tej, którą wcześniej wklejono z tabeli (dopasowanie po numerze albo po terminie i kWh).

## 0.14.0

* Nowa zakładka **Zużycie** ze statystykami z faktur: kafelki (ostatnie 12 miesięcy w m³ i kWh, koszt, średnia cena, rok do roku),
  interaktywny wykres miesięczny (m³, kWh albo zł, z przewijaniem i zoomem), **profil sezonowy** (średnie zużycie na miesiąc i
  impulsy na dobę, czyli to, co gazomierz będzie liczył w danym miesiącu) oraz tabela roczna.
* **Import faktur z eBOK:** wklejasz tabelę ze strony „Faktury” (zaznacz, skopiuj, wklej), apka ją rozbiera (numer, termin, kwota,
  zużycie w kWh, noty odsetkowe są pomijane), pokazuje podgląd i po potwierdzeniu zapisuje. Ponowne wklejenie aktualizuje
  istniejące faktury i dodaje nowe. Dane zostają tylko w apce. Apka nie loguje się do eBOK i nie zna hasła.
* **Kalibracja współczynnika kWh/m³:** apka porównuje faktury z historią stanu licznika z tych samych miesięcy (np. po imporcie z Home Assistant)
  i podpowiada współczynnik (mediana z miesięcy). Przycisk „Użyj” go zapisuje.

## 0.13.0

* **Import historii z Home Assistant.** Zakładka Serwis, karta „Historia z Home Assistant”: apka czyta statystyki długoterminowe
  wybranej encji (np. `sensor.gazomierz`) przez API Home Assistant i dołącza je do swojej historii. Nie trzeba eksportować CSV.
  Wybierasz encję z listy (rodzaj, czyli stan licznika w m³ albo napięcie baterii w V, ustawia się sam według jednostki), oglądasz
  podgląd (zakres dat, liczba punktów, pierwsza i ostatnia wartość) i po potwierdzeniu importujesz. Jeśli encja liczy w impulsach,
  wpisz dzielnik (impulsów na m³). Zaimportowane dane są tylko starsze niż pierwszy odczyt z nowego gazomierza, nie zmieniają niczego
  w Home Assistant i można je usunąć jednym przyciskiem.
* Wykresy, zużycie na godzinę, przepływ i statystyki korzystają ze scalonej historii. Okno historii sięga do 10 lat wstecz,
  historia stanu licznika jest przechowywana dłużej (do 150 000 punktów), a daty w długich zakresach mają rok.

## 0.12.1

* Delikatny efekt przejścia między zakładkami (gest w bok albo kliknięcie zakładki): stara zakładka lekko odsuwa się i blednie,
  nowa płynnie wjeżdża z kierunku gestu, a podkreślenie aktywnej zakładki w nagłówku płynnie przesuwa się pod nową.
  Efekt wyłącza się przy ustawieniu systemu „ogranicz animacje”.
* Gest w bok nie jest już ignorowany na polach tekstowych (tylko na polu, które właśnie edytujesz, na suwakach i listach wyboru),
  bo na stronie Ustawienia wyglądało to jak „gest czasem nie działa”.

## 0.12.0

* **Potwierdzenia wrażliwych akcji.** Przed wysłaniem do gazomierza apka pyta o potwierdzenie przy: restarcie gazomierza,
  aktualizacji firmware, włączeniu i wyłączeniu trybu serwisowego, zmianie stałego IP i wszystkich ustawień sieci (IP, brama,
  maska, DNS, nazwa i hasło WiFi), ustawianiu stanu licznika oraz zmianie parametrów (odstęp wysyłki, odstęp raportu,
  debounce, impulsy na m³, kalibracja i progi baterii). Okno pokazuje, co się zmieni (np. „100 ms → 150 ms”,
  stary i nowy stan licznika w m³), ostrzega o skutkach i można je zamknąć przyciskiem Anuluj, klawiszem Esc albo kliknięciem w tło.
  Przy akcjach niebezpiecznych przycisk potwierdzenia jest przez chwilę zablokowany, żeby nie zadziałał od przypadkowego
  podwójnego dotknięcia. Hasło WiFi jest w oknie ukryte.
* Do tej pory przycisk restartu używał systemowego okna potwierdzenia, które w ramce Home Assistant bywa po cichu blokowane,
  więc mógł nie robić nic. Teraz jest własne okno.
* „Ustaw stan licznika” nie przyjmuje pustego pola (wcześniej puste pole oznaczało 0 impulsów).
* **Demo i suwaki:** przewijanie w pionie czasem „nie łapało”, gdy palec zaczynał się na suwaku (suwak przechwytywał dotyk).
  Suwaki i wykresy pozwalają teraz przewijać stronę, a ramka Demo nie ma własnego przewijania. Przesunięcie w bok w Demo
  przełącza zakładkę.

## 0.11.0

* **Przełączanie zakładek gestem:** przesunięcie palcem w lewo albo w prawo na stronie przechodzi do następnej lub poprzedniej
  zakładki (z krótką animacją). Gest nie działa na polach tekstowych, suwakach, pasku zakładek, w oknie historii ani na pasku
  przeglądu wykresu, więc nie koliduje z ich obsługą.
* **Przewijanie strony:** wykresy i pasek zakładek przechwytywały ruchy palca w poziomie, przez co przewijanie w pionie
  czasem „nie łapało”, zależnie od miejsca dotknięcia. Teraz **jeden palec na wykresie przewija stronę**, a wykres
  powiększasz i przesuwasz **dwoma palcami**. Dotknięcie pokazuje wartość, a pasek przeglądu pod wykresem przesuwa okno jednym palcem.
  Na komputerze nic się nie zmienia (przeciąganie, kółko myszy, dwuklik).
* Węższe przyciski zakładek na telefonie, żeby więcej się mieściło bez przewijania paska.

## 0.10.0

* **Naprawa:** od wersji 0.9.0 kafelki w Przeglądzie nie otwierały historii po kliknięciu (przy przebudowie na kafelki
  usunąłem obsługę kliknięcia). Teraz znów działają, a kafel Bateria pokazuje napięcie baterii.
* Nowy interaktywny wykres w oknie historii i w zakładce Bateria: przewijanie przeciąganiem, zoom kółkiem myszy, szczypaniem
  (telefon) i przyciskami +/−, dwuklik pokazuje cały zakres, pasek przeglądu całej historii z przesuwanym oknem,
  podpowiedź z dokładną wartością i czasem, przyciski zakresów (od 1 godz. do wszystkiego), gradient pod linią,
  słupki dla zużycia, linie progów i znacznik „teraz”. Po powiększeniu wykres dociąga dokładniejsze dane z wybranego okna.
* Gdy gazomierz nie przysłał jeszcze danych baterii, okno historii to wyjaśnia i podpowiada zakładkę Bateria (jest tam test rozładowania).
* Historia ma teraz więcej punktów (do 5000) i okno historii sięga do 400 dni wstecz.

## 0.9.3

* Nazwa apki w sklepie i w pasku bocznym: **Energia Gazomierz** (żeby była obok „Energia Woda” w kolejności alfabetycznej).

## 0.9.2

* Naprawa: po aktualizacji panel mógł zostać na „Ładowanie…”, bo przeglądarka (albo aplikacja HA) trzymała starą kopię
  skryptu. Adresy plików mają teraz numer wersji, a pliki statyczne wysyłane są bez buforowania.
  Jeśli panel nadal się nie ładuje po aktualizacji, odśwież stronę (w aplikacji HA: zamknij i otwórz panel ponownie).

## 0.9.1

* Logo ORLEN w nagłówku i na ikonie apki (pliki dostarczone przez użytkownika), czerwień motywu dopasowana do logo (#D81E05).

## 0.9.0

* Nowy wygląd w stylu ORLEN i układzie aplikacji GPK Szemud: czerwony nagłówek z logo, zakładki w nagłówku,
  kafelki z odczytami w Przeglądzie, stan połączenia i przycisk odświeżania.
* Nazwa apki zmieniona na **Gazomierz**. Interfejs, powiadomienia, opisy opcji i dokumentacja tylko po polsku.
* Własne logo i ikona (płomień i tarcza licznika). Oficjalnego logo ORLEN nie dołączam, żeby podmienić je na własne,
  zastąp pliki `static/logo.png` i `icon.png`.
* Opcja `language` jest ignorowana.

## 0.8.0

* Choose who gets the battery notifications in the panel (Battery tab): the people of your Home Assistant
  with their phones, plus other phones with the Companion app. Several people or phones can be ticked.
  The option `notify_service` is now only an optional extra target.

## 0.7.1

* Notifications: the test button and the list of recent messages now say why a message was not delivered
  (wrong `notify_service` name, no permission for the Home Assistant API, ...) instead of always showing "sent".

## 0.7.0

* Battery notifications through Home Assistant: periodic report (charge and estimated life, charge-by date),
  warnings when the battery has to be charged (with reminders), a note when it was charged and an alert when
  the meter is silent. A notification in Home Assistant and optionally a push to the phone (`notify_service`).
* New options: `notify_service`, `notify_persistent`, `battery_report`, `battery_warn_days`,
  `battery_critical_days`, `silent_alert_hours`.
* Battery tab: notification status, test and "send the report now" buttons, list of recent messages.
* The forecast now always runs to the thresholds the firmware really uses (3.10 V, 3.00 V).

## 0.6.0

* The panel is split into tabs: **Overview**, **Battery**, **Settings**, **Network**, **Service**, **Demo**.
  The discharge test card moved to the Battery tab, diagnostics to Service.
* A number on a tab shows how many commands wait for the meter. The last used tab is remembered.
* Short explanation at the top of Settings, Network and Service.

## 0.5.0

* Battery settings: cell type (NCR18650GA, NCR18650B, NCR18650PF, 35E, 30Q, MJ1, 25R or custom),
  number of cells and usable part of the label capacity. The Battery tab shows how the capacity was
  calculated. This replaces the `battery_capacity_mah` option of 0.4.0.
* Real capacity of your cell from the discharge test: enter the test current and the number of cells,
  the panel computes the capacity (while the test runs as an estimate, afterwards as a measurement),
  saves it and uses it for the life prediction.

## 0.4.0

* New **Battery** tab: voltage history with a forecast to the WiFi stop voltage and the cut-off
  voltage, two independent life predictions (usage model and voltage trend, with a confidence level),
  where the energy goes (sleep, self-discharge, WiFi sessions), a "what if" slider (battery life for a
  different gas use) and nerd statistics (pulses, sessions and wake-ups per day, average current,
  mAh per m³ of gas, WiFi connect time and signal).
* The panel learns the real discharge curve of your cells from the discharge test
  (`firmware/battery_test`) when a run reaches 3.0 V and uses it instead of the generic curve.
* Battery, signal and session history is kept for about a year (one sample per 15 minutes).
* New option `battery_capacity_mah` (default 5900, two 18650 cells with a reserve for cold).
* Fix: the active tab highlight of the history window and chart tabs no longer disappears.

## 0.3.0

* History of every value: click the meter reading, flow, today, battery, WiFi signal (or the battery
  test values) to open a "more info" style window with a chart, range buttons (1 h to 14 days),
  hover readout and min / max / average.
* New **Demo** tab with the visual simulator (spinning gas meter, reed, ESP32 sleep / WiFi timeline,
  Home Assistant view, battery estimate). It is also available without Home Assistant in
  `docs/simulator/` of the repository.

## 0.2.0

* Battery discharge test card and chart: the panel also listens to the topic of the
  `firmware/battery_test` sketch (option `battery_test_topic`, default `Gaz/BatteryTest`).
  The voltage is recalculated from the pin voltage with an adjustable divider factor.

## 0.1.1

* Show a notice while the meter has not published any data yet.

## 0.1.0

* First version: sidebar panel with readings (meter, flow, today, battery, WiFi), hourly
  consumption and battery charts, settings, service mode, network settings, set meter reading,
  diagnostics. MQTT discovery for the meter reading, battery voltage, battery percent and signal.
