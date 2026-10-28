# Testy na stole (bez gazu)

Gazomierz symulujesz zwieraniem przewodów kontaktronu (pin D12 i GND). Jedno zwarcie = jeden impuls = 0,01 m³.
Do każdego testu jest „co zrobić” i „czego się spodziewać”. Odhaczaj i dopisuj, co wyszło.

## Zasady przy ręcznym zwieraniu

- Zwieraj **na około pół sekundy**, potem rozewrzyj. Firmware czeka 100 ms na stabilny poziom, więc zbyt krótkie muśnięcie przewodem może nie zadziałać.
- Między impulsami zostaw **minimum 1 sekundę**. Prawdziwy gazomierz daje impuls najwyżej raz na kilka sekund. Ochrona przed drganiami uśpi urządzenie na 30 s,
  jeśli w ciągu 10 s zrobisz więcej niż 15 wybudzeń (to celowe, test T3).
- Dane w apce pojawiają się po **około 20–60 sekundach** (firmware łączy impulsy w paczki co najmniej 20 s). Zielona dioda zapala się, gdy układ jest wybudzony.
- Pracuj na baterii (USB odłączone) tylko tam, gdzie test tego wymaga. Do podglądu logów (`DEBUG_SERIAL 1`) możesz użyć USB.

## Przygotowanie

- [ ] Wgrany szkic `firmware/gas_meter` (nie testowy), `secrets.h` uzupełnione, broker MQTT działa.
- [ ] W apce: Serwis → „Stan licznika” wpisz **728243** (to 7282,43 m³), zrestartuj urządzenie i sprawdź, czy Przegląd pokazuje 7282,43 m³.
- [ ] Zapisz startową wartość i godzinę: ______

## T1. Zliczanie impulsów

**Zrób:** 20 zwarć co 2–3 sekundy.
**Oczekiwane:** po minucie stan 7282,63 m³ (+0,20). Sprawdź też „Dziś” na Przeglądzie.
- [ ] Wynik: ______

## T2. Długie zwarcie

**Zrób:** zewrzyj na 10 sekund, potem rozewrzyj.
**Oczekiwane:** dokładnie **1 impuls** (+0,01), nie dziesięć.
- [ ] Wynik: ______

## T3. Ochrona przed drganiami

**Zrób:** w ciągu 5 sekund wykonaj kilkadziesiąt szybkich muśnięć przewodem.
**Oczekiwane:** urządzenie nie wiesza się, doliczy około kilkunastu impulsów i na 30 s zignoruje resztę. Po minucie znowu działa normalnie (zrób 3 zwarcia i sprawdź +0,03).
- [ ] Wynik: ______

## T4. Paczki WiFi

**Zrób:** 5 zwarć w ciągu 15 sekund.
**Oczekiwane:** wszystkie 5 impulsów w apce (+0,05), a liczba sesji WiFi (Bateria → Statystyki, „Sesji WiFi na dobę”) rośnie o mniej niż 5.
- [ ] Wynik: ______

## T5. Ustawienie stanu licznika

**Zrób:** w Serwisie wpisz inny stan, np. 700000 (7000,00 m³), zrestartuj urządzenie.
**Oczekiwane:** Przegląd pokazuje 7000,00 m³, polecenie „Stan licznika” znika (używa się go raz). Wróć do 728243 i sprawdź ponownie.
- [ ] Wynik: ______

## T6. Utrata zasilania (wymiana baterii)

**Zrób:** zrób 3 zwarcia, odczekaj minutę i zapisz stan. Wyjmij baterie na 15 s, włóż.
**Oczekiwane:** po starcie (do minuty) ten sam stan co przed wyjęciem, bez skoku.
- [ ] Wynik: ______
**Wariant:** wyjmij baterie **od razu** po zwarciu (w ciągu 1 s). Zanotuj, czy ostatni impuls się zachował (powinien, bo zapis do flash jest tuż przed uśpieniem, ale to najtrudniejszy przypadek).
- [ ] Wynik: ______

## T7. Brak WiFi

**Zrób:** wyłącz WiFi (lub punkt dostępowy, z którym łączy się gazomierz), zrób 5 zwarć, włącz WiFi z powrotem.
**Oczekiwane:** po powrocie WiFi stan dogania w ciągu kilku do kilkunastu minut (ponawianie co 1, 2, 4, 15 minut). Wszystkie 5 impulsów jest policzonych.
- [ ] Wynik (po ilu minutach): ______

## T8. Brak brokera MQTT

**Zrób:** zatrzymaj dodatek MQTT na 5 minut, zrób 5 zwarć, uruchom dodatek.
**Oczekiwane:** po powrocie brokera stan dogania, impulsy nie giną.
- [ ] Wynik: ______

## T9. Restart Home Assistanta i apki

**Zrób:** zrestartuj Home Assistanta, potem samą apkę.
**Oczekiwane:** encje wracają z poprawnymi wartościami, Przegląd i Zużycie działają, statystyka w panelu Energia dalej się dopisuje (nowe godziny po kilkunastu minutach).
- [ ] Wynik: ______

## T10. Raport statusu

**Zrób:** poczekaj na status co 6 godzin albo wymuś go restartem (status wysyłany jest przy starcie).
**Oczekiwane:** w apce aktualne napięcie baterii, sygnał WiFi, „Ostatnie dane: kilka minut temu”.
- [ ] Wynik: ______

## T11. Tryb serwisowy i restart z apki

**Zrób:** Serwis → włącz tryb serwisowy (potwierdź), sprawdź, że urządzenie ciągle odpowiada; wyłącz. Potem „Restart” (potwierdź).
**Oczekiwane:** każda wrażliwa akcja pyta o potwierdzenie. Po restarcie stan licznika bez zmian.
- [ ] Wynik: ______

## T12. Niskie napięcie (opcjonalnie, tylko z zasilaczem laboratoryjnym)

**Zrób:** zasil płytkę 3,05 V zamiast baterii, zrób 3 zwarcia. Potem 2,95 V i 3 zwarcia, potem znów 3,8 V i reset przyciskiem RST.
**Oczekiwane:** przy 3,05 V (poniżej 3,10 V) impulsy są liczone, ale bez WiFi, a po powrocie napięcia dochodzą do apki. Przy 2,95 V urządzenie hibernuje (impulsy nie są liczone), po resecie działa normalnie.
- [ ] Wynik: ______

## T13. Powiadomienia

**Zrób:** zakładka Bateria → „Wyślij testowe powiadomienie”, sprawdź telefon.
**Oczekiwane:** powiadomienie przychodzi do wybranych osób. Zbadaj też alarm „brak danych”: odłącz gazomierz na dłużej niż ustawione `silent_hours` (domyślnie opisane w apce).
- [ ] Wynik: ______

## Po testach

- [ ] Ustaw `STATUS_LED 0`, `DEBUG_SERIAL 0` i wgraj finalny szkic.
- [ ] Przed instalacją przy liczniku gazowym: odczytaj licznik i wpisz jego stan w impulsach (m³ × 100) w Serwisie.
