import "react-native-gesture-handler";
import React, { useEffect } from "react";

import {
  ActivityIndicator,
  StatusBar,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { RootNavigation } from "./navigation/RootNavigation";

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };
  const persistor = persistStore(store);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar
          barStyle={"light-content"}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <RootNavigation />
      </PersistGate>
    </Provider>
  );
}

export default App;
