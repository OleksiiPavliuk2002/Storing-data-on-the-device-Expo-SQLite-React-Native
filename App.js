import "react-native-gesture-handler";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { initializeStore } from "./store";
import MainNavigator from "./navigators/MainNavigator";

export default function App() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      const storeInstance = await initializeStore();
      setStore(storeInstance);
    };
    initApp();
  }, []);

  if (!store) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <MainNavigator />
    </Provider>
  );
}