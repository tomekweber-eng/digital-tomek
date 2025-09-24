const fs = require('fs');
const path = require('path');

// Funkcja eksportu konwersacji do CSV
function exportConversationsToCSV() {
  try {
    const conversationsDir = path.join(__dirname, 'conversations');
    
    // Sprawdź czy folder istnieje
    if (!fs.existsSync(conversationsDir)) {
      console.log('Brak folderu conversations');
      return;
    }
    
    // Pobierz wszystkie pliki JSON
    const files = fs.readdirSync(conversationsDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('Brak plików konwersacji');
      return;
    }
    
    // Przygotuj dane CSV
    let csvContent = 'Data,Godzina,Pytanie,Odpowiedź,Język\n';
    
    files.forEach(file => {
      const filePath = path.join(conversationsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const conversations = JSON.parse(content);
      
      conversations.forEach(conv => {
        const date = new Date(conv.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0];
        
        // Escapowanie CSV (zamiana cudzysłowów na podwójne)
        const question = conv.question.replace(/"/g, '""');
        const answer = conv.answer.replace(/"/g, '""');
        
        csvContent += `"${dateStr}","${timeStr}","${question}","${answer}","${conv.language}"\n`;
      });
    });
    
    // Zapisz do pliku CSV
    const csvPath = path.join(__dirname, 'conversations_export.csv');
    fs.writeFileSync(csvPath, csvContent);
    
    console.log(`✅ Wyeksportowano konwersacje do: ${csvPath}`);
    console.log(`📊 Liczba konwersacji: ${csvContent.split('\n').length - 2}`);
    
  } catch (error) {
    console.error('❌ Błąd eksportu:', error.message);
  }
}

// Uruchom eksport
exportConversationsToCSV();
