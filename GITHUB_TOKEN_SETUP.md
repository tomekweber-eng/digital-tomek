# 🔑 Konfiguracja GitHub Token dla zapisu konwersacji

## Problem
Vercel (serverless) nie może zapisywać plików lokalnie, więc używamy GitHub API do zapisywania konwersacji bezpośrednio do repozytorium.

## Rozwiązanie
Stwórz GitHub Personal Access Token i dodaj go do Vercel jako zmienną środowiskową.

---

## Krok 1: Stwórz GitHub Token

1. **Idź na GitHub:** https://github.com/settings/tokens
2. **Kliknij:** "Generate new token" → "Generate new token (classic)"
3. **Wypełnij formularz:**
   - **Note:** `Vercel Conversations Logger`
   - **Expiration:** `No expiration` (lub wybierz okres)
   - **Zaznacz uprawnienia:**
     - ✅ `repo` (Full control of private repositories)
       - ✅ `repo:status`
       - ✅ `repo_deployment`
       - ✅ `public_repo`
       - ✅ `repo:invite`
4. **Kliknij:** "Generate token"
5. **SKOPIUJ TOKEN** (wygląda jak: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - ⚠️ **UWAGA:** Token pokazuje się tylko raz! Zapisz go w bezpiecznym miejscu.

---

## Krok 2: Dodaj Token do Vercel

1. **Idź na Vercel:** https://vercel.com/
2. **Wybierz projekt:** `digital-tomek`
3. **Kliknij:** Settings → Environment Variables
4. **Dodaj nową zmienną:**
   - **Name:** `GITHUB_TOKEN`
   - **Value:** Wklej skopiowany token (np. `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Environment:** Zaznacz wszystkie (Production, Preview, Development)
5. **Kliknij:** "Save"

---

## Krok 3: Zrestartuj Vercel Deployment

1. **Idź do:** Deployments
2. **Znajdź ostatni deployment**
3. **Kliknij:** ••• (three dots) → "Redeploy"
4. **Lub po prostu:** zrób nowy push do GitHub (automatycznie wdroży)

---

## Krok 4: Testowanie

Po skonfigurowaniu tokena:

1. Odwiedź stronę: https://tomaszweber.com
2. Otwórz chat widget
3. Wyślij testową wiadomość (po angielsku)
4. Sprawdź GitHub: https://github.com/tomekweber-eng/digital-tomek/tree/main/conversations

Powinieneś zobaczyć nowy plik z dzisiejszą datą (np. `2025-09-30.json`)!

---

## ✅ Gotowe!

Teraz każda konwersacja będzie automatycznie zapisywana do GitHub w folderze `conversations/`

### Struktura pliku:
```json
[
  {
    "timestamp": "2025-09-30T15:30:00.000Z",
    "question": "Tell me about Tomasz experience",
    "answer": "Tomasz has extensive experience...",
    "language": "en"
  }
]
```

---

## 🔧 Troubleshooting

### Problem: Konwersacje się nie zapisują

1. **Sprawdź token na Vercel:**
   - Settings → Environment Variables → GITHUB_TOKEN
   
2. **Sprawdź uprawnienia tokena:**
   - Musi mieć zaznaczone `repo`
   
3. **Sprawdź logi na Vercel:**
   - Deployments → (wybierz ostatni) → Functions → `api/chat` → View Logs

### Problem: 401 Unauthorized

- Token jest nieprawidłowy lub wygasł
- Stwórz nowy token i zaktualizuj w Vercel

### Problem: 404 Not Found

- Sprawdź czy nazwa repozytorium jest poprawna w `api/save-to-github.js`:
  - `REPO_OWNER = 'tomekweber-eng'`
  - `REPO_NAME = 'digital-tomek'`

---

## 📊 Eksport konwersacji

Możesz nadal używać lokalnych skryptów do analizy:

```bash
# Pobierz najnowsze konwersacje z GitHub
git pull origin main

# Eksportuj do CSV
node export-conversations.js

# Eksportuj wszystko
node export-all.js
```
