# Synchronizacja lokalnej wersji z repozytorium zdalnym

Jeżeli zmiany zostały już wprowadzone i zatwierdzone w repozytorium zdalnym (np. na GitHubie), a chcesz pobrać je do swojej lokalnej kopii projektu, wykonaj poniższe kroki.

## 1. Sprawdź bieżącą gałąź
Upewnij się, że pracujesz na gałęzi, którą chcesz zaktualizować:

```bash
git status
```

Jeżeli masz lokalne modyfikacje, których nie chcesz utracić, zatwierdź je (`git commit`) lub tymczasowo schowaj za pomocą `git stash`.

## 2. Pobierz najnowsze dane z repozytorium zdalnego

```bash
git fetch origin
```

Polecenie `fetch` pobiera aktualny stan wszystkich gałęzi zdalnych, ale nie wprowadza zmian do Twojej lokalnej gałęzi.

## 3. Zsynchronizuj lokalną gałąź z gałęzią zdalną

Jeżeli chcesz zaktualizować tę samą gałąź, na której jesteś (np. `main`):

```bash
git pull --rebase origin main
```

Polecenie `git pull --rebase` stosuje Twoje lokalne commity na wierzchu commitów zdalnych, dzięki czemu historia jest liniowa. Jeżeli wolisz standardowe łączenie commitów, możesz użyć `git pull origin main`.

## 4. Rozwiązywanie konfliktów

Jeśli pojawią się konflikty merge/rebase, Git wskaże pliki wymagające ręcznej interwencji. Po rozwiązaniu konfliktów oznacz pliki jako rozwiązane i kontynuuj proces:

```bash
git add <plik>
git rebase --continue   # lub git merge --continue
```

## 5. Aktualizacja innych gałęzi

Dla innej gałęzi (np. `feature/login-fix`) wykonaj analogiczne polecenia, podmieniając nazwę gałęzi:

```bash
git checkout feature/login-fix
git pull --rebase origin feature/login-fix
```

## 6. Pobranie zmian bez przełączania gałęzi

Gdy chcesz tylko pobrać zmiany i zobaczyć je później:

```bash
git fetch origin feature/login-fix:feature/login-fix
```

To polecenie tworzy/aktualizuje lokalną gałąź `feature/login-fix` bez przełączania się na nią.

---

Po wykonaniu powyższych kroków Twoja lokalna kopia będzie odzwierciedlała stan repozytorium zdalnego, w którym znajduje się naprawiona wersja modułu logowania.
