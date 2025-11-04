import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "./themeSlice";
import wordsLearningSlice from "./wordsLearningSlice";
import { init, getWords, getTheme } from "./dbUtils";

let store = null;

export async function initializeStore() {
  try {
    await init();

    const [words, theme] = await Promise.all([
      getWords(),
      getTheme()
    ]);

    store = configureStore({
      reducer: {
        theme: themeSlice.reducer,
        wordsLearning: wordsLearningSlice.reducer,
      },
      preloadedState: {
        theme: {
          isDark: theme?.isDark === 1,
          colors: theme?.isDark === 1 
            ? require("../constants").COLORS_DARK 
            : require("../constants").COLORS_LIGHT,
        },
        wordsLearning: {
          words: words || []
        }
      }
    });

    return store;
  } catch (error) {
    console.error("Failed to initialize store:", error);
    store = configureStore({
      reducer: {
        theme: themeSlice.reducer,
        wordsLearning: wordsLearningSlice.reducer,
      }
    });
    return store;
  }
}

export function getStore() {
  if (!store) {
    throw new Error('Store not initialized. Call initializeStore() first.');
  }
  return store;
}

export default initializeStore;