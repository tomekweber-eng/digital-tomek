const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Funkcja eksportu do CSV
function exportToCSV() {
  try {
    const conversationsDir = path.join(__dirname, 'conversations');
    const files = fs.readdirSync(conversationsDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('❌ Brak plików konwersacji');
      return;
    }
    
    let csvContent = 'Data,Godzina,Pytanie,Odpowiedź,Język\n';
    let totalConversations = 0;
    
    files.forEach(file => {
      const filePath = path.join(conversationsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const conversations = JSON.parse(content);
      
      conversations.forEach(conv => {
        const date = new Date(conv.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0];
        
        const question = conv.question.replace(/"/g, '""');
        const answer = conv.answer.replace(/"/g, '""');
        
        csvContent += `"${dateStr}","${timeStr}","${question}","${answer}","${conv.language}"\n`;
        totalConversations++;
      });
    });
    
    const csvPath = path.join(__dirname, 'conversations_export.csv');
    fs.writeFileSync(csvPath, csvContent);
    
    console.log(`✅ CSV: ${csvPath} (${totalConversations} konwersacji)`);
    return totalConversations;
    
  } catch (error) {
    console.error('❌ Błąd eksportu CSV:', error.message);
    return 0;
  }
}

// Funkcja eksportu do JSON
function exportToJSON() {
  try {
    const conversationsDir = path.join(__dirname, 'conversations');
    const files = fs.readdirSync(conversationsDir).filter(file => file.endsWith('.json'));
    
    let allConversations = [];
    
    files.forEach(file => {
      const filePath = path.join(conversationsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const conversations = JSON.parse(content);
      allConversations = allConversations.concat(conversations);
    });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalConversations: allConversations.length,
      conversations: allConversations
    };
    
    const jsonPath = path.join(__dirname, 'conversations_export.json');
    fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ JSON: ${jsonPath} (${allConversations.length} konwersacji)`);
    return allConversations.length;
    
  } catch (error) {
    console.error('❌ Błąd eksportu JSON:', error.message);
    return 0;
  }
}

// Funkcja commitu na GitHub
function commitToGitHub() {
  return new Promise((resolve) => {
    exec('./git-commit-conversations.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Błąd commitu:', error.message);
        resolve(false);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve(true);
    });
  });
}

// Główna funkcja
async function exportAll() {
  console.log('🚀 Rozpoczynam eksport konwersacji...\n');
  
  const csvCount = exportToCSV();
  const jsonCount = exportToJSON();
  
  console.log('\n📊 Podsumowanie:');
  console.log(`- Konwersacje w CSV: ${csvCount}`);
  console.log(`- Konwersacje w JSON: ${jsonCount}`);
  
  console.log('\n🔄 Wysyłam na GitHub...');
  const gitSuccess = await commitToGitHub();
  
  if (gitSuccess) {
    console.log('\n✅ Wszystko gotowe!');
  } else {
    console.log('\n⚠️  Eksport zakończony, ale GitHub wymaga ręcznej konfiguracji');
  }
}

// Uruchom eksport
exportAll();
