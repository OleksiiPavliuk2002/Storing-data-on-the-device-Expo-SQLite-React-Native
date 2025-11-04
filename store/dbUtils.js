import * as SQLite from "expo-sqlite";

export const database = SQLite.openDatabase("dictionary.db");

const executeSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(
          query,
          params,
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export async function init() {
  try {
    await executeSql(`
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE NOT NULL,
        translation TEXT,
        image TEXT,
        dateForgets INTEGER,
        dateTotallyForgets INTEGER,
        forgettingSpan INTEGER,
        status INTEGER,
        phonetics TEXT,
        partOfSpeech TEXT,
        meaning TEXT
      )`);

    const result = await executeSql("PRAGMA table_info(words)");
    const columns = result.rows._array.map(col => col.name);
    
    if (!columns.includes('phonetics')) {
      await executeSql('ALTER TABLE words ADD COLUMN phonetics TEXT');
    }
    if (!columns.includes('partOfSpeech')) {
      await executeSql('ALTER TABLE words ADD COLUMN partOfSpeech TEXT');
    }
    if (!columns.includes('meaning')) {
      await executeSql('ALTER TABLE words ADD COLUMN meaning TEXT');
    }

    await executeSql(`
      CREATE TABLE IF NOT EXISTS theme (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isDark INTEGER DEFAULT 0
      )`);

    const theme = await getTheme();
    if (!theme) {
      await executeSql("INSERT INTO theme (id, isDark) VALUES (1, 0)");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error; 
  }
}

export async function addWord(word) {
  try {
    const result = await executeSql(
      `INSERT INTO words 
      (word, translation, image, dateForgets, dateTotallyForgets, forgettingSpan, status, phonetics, partOfSpeech, meaning) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        word.word,
        word.translation,
        word.image,
        word.dateForgets,
        word.dateTotallyForgets,
        word.forgettingSpan,
        word.status,
        word.phonetics || '',
        word.partOfSpeech || '',
        word.meaning || '',
      ]
    );
    return { insertId: result.insertId };
  } catch (error) {
    console.error("Error adding word:", error);
    throw error;
  }
}

export async function updateWord(word) {
  try {
    await executeSql(
      `UPDATE words SET 
        translation = ?,
        image = ?,
        dateForgets = ?,
        dateTotallyForgets = ?,
        forgettingSpan = ?,
        status = ?,
        phonetics = ?,
        partOfSpeech = ?,
        meaning = ?
        WHERE word = ?`,
      [
        word.translation,
        word.image,
        word.dateForgets,
        word.dateTotallyForgets,
        word.forgettingSpan,
        word.status,
        word.phonetics || '',
        word.partOfSpeech || '',
        word.meaning || '',
        word.word,
      ]
    );
  } catch (error) {
    console.error("Error updating word:", error);
    throw error;
  }
}

export async function deleteWord(wordText) {
  try {
    await executeSql("DELETE FROM words WHERE word = ?", [wordText]);
  } catch (error) {
    console.error("Error deleting word:", error);
    throw error;
  }
}

export async function getWords() {
  try {
    const result = await executeSql("SELECT * FROM words");
    return result.rows._array;
  } catch (error) {
    console.error("Error getting words:", error);
    return [];
  }
}

export async function getTheme() {
  try {
    const result = await executeSql("SELECT isDark FROM theme WHERE id = 1");
    return result.rows.length > 0 ? { isDark: result.rows.item(0).isDark } : null;
  } catch (error) {
    console.error("Error getting theme:", error);
    return null;
  }
}

export async function setTheme(isDark) {
  try {
    await executeSql("INSERT OR REPLACE INTO theme (id, isDark) VALUES (1, ?)", [isDark ? 1 : 0]);
  } catch (error) {
    console.error("Error setting theme:", error);
    throw error;
  }
}