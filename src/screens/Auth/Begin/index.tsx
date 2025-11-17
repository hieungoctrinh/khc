import {
  ImageBackground,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import R from "@assets/index";
import { useSelector } from "react-redux";
import { IAppData } from "@redux/store";
import NavigationServices from "@navigation/NavigationServices";

const BeginScreen: React.FC = () => {
  const token = useSelector((state: IAppData) => state.account.token);
  const endpoint = useSelector((state: IAppData) => state.app.endpoint);
  const [rehydrated, setRehydrated] = React.useState(false);

  useEffect(() => {
    // Rehydrated chắc chắn xong nếu PersistGate đã render
    if (endpoint === undefined) return; // chưa rehydrate xong app
    setRehydrated(true);
  }, [endpoint]);

  useEffect(() => {
    if (!rehydrated) return;

    if (token && endpoint) {
      NavigationServices.replace("HomeScreen");
    } else if (!token && endpoint) {
      NavigationServices.replace("LoginScreen");
    } else {
      NavigationServices.replace("CheckinEndpoint");
    }
  }, [rehydrated, token, endpoint]);

  if (!rehydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#5A2E0E" size="large" />
      </View>
    );
  }

  return null;
};

export default BeginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    opacity: 0.3,
  },
  body: { alignItems: "center", justifyContent: "center" },
});
