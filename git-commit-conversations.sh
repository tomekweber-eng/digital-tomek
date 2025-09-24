#!/bin/bash

# Skrypt do automatycznego commitu konwersacji na GitHub

echo "🔄 Sprawdzam status repozytorium..."

# Sprawdź czy jesteśmy w repozytorium git
if [ ! -d ".git" ]; then
    echo "❌ To nie jest repozytorium git. Inicjalizuję..."
    git init
    echo "📝 Dodaj remote origin: git remote add origin https://github.com/TWOJ_USERNAME/chatbot-conversations.git"
    exit 1
fi

# Dodaj wszystkie pliki konwersacji
echo "📁 Dodaję pliki konwersacji..."
git add conversations/

# Sprawdź czy są zmiany do commitu
if git diff --staged --quiet; then
    echo "ℹ️  Brak nowych konwersacji do commitu"
    exit 0
fi

# Stwórz commit z datą
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="Dodaj konwersacje - $TIMESTAMP"

echo "💾 Tworzę commit: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push do GitHub (jeśli skonfigurowane)
echo "🚀 Wysyłam na GitHub..."
if git push origin main 2>/dev/null; then
    echo "✅ Konwersacje zostały wysłane na GitHub!"
else
    echo "⚠️  Nie udało się wysłać na GitHub. Sprawdź konfigurację remote."
    echo "💡 Uruchom: git push origin main"
fi

echo "📊 Status repozytorium:"
git status --short
