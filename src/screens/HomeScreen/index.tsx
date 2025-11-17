import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  BackHandler,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import NavigationServices from "@navigation/NavigationServices";
import Icon from "react-native-vector-icons/FontAwesome";
import { clearAccountData } from "@redux/features/account/accountSlice";
import { IAppData } from "@redux/store";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { logo, clubName } = useSelector((state: IAppData) => state.app);
  const domain = useSelector((state: IAppData) => state.app.endpoint);

  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Xác nhận xoá tài khoản",
      "Bạn có chắc chắn muốn xoá tài khoản này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              console.log("🧩 Gửi yêu cầu xoá domain:", domain);

              const res = await fetch(
                // "https://checkin-worker.huydevdigital.workers.dev/delete",
                "https://checkin.khc.workers.dev/delete",
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ domain }),
                }
              );

              const data = await res.json();
              console.log("📨 Delete response:", data);

              if (res.ok) {
                Alert.alert(
                  "Thành công",
                  "Yêu cầu xoá tài khoản đã được gửi!",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        dispatch(clearAccountData());
                        NavigationServices.navigate("LoginScreen");
                      },
                    },
                  ],
                  { cancelable: false }
                );
              } else {
                Alert.alert("Lỗi", data.message || "Không thể xoá ứng dụng.");
              }
            } catch (err) {
              console.log("❌ Lỗi khi gọi API:", err);
              Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            dispatch(clearAccountData());
            NavigationServices.reset("LoginScreen");
          },
        },
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleLogout();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove(); // <--- Sửa tại đây
    }, [])
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.title_top}>Trang chủ</Text>
        <TouchableOpacity onPress={() => handleLogout()} style={styles.backBtn}>
          <Icon name="sign-out" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image source={{ uri: logo }} style={styles.logo} />
            <Text style={styles.titleclb}>{clubName}</Text>
          </View>

          <Text style={styles.title}>Chọn phương thức</Text>
          <Text style={styles.subtitle}>
            Bằng cách sử dụng chức năng quét QR Code hoặc nhập Mã Code để kiểm
            tra vé
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => NavigationServices.navigate("QrScan")}
            >
              <View style={styles.iconWrapper}>
                <Icon name="qrcode" size={18} color="#5A2E0E" />
              </View>
              <View>
                <Text style={styles.buttonText}>QR Code</Text>
                <Text style={styles.text}>Quét mã QR Code có trên vé</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => NavigationServices.navigate("CodeEntry")}
            >
              <View style={styles.iconWrapper}>
                <Icon name="hashtag" size={18} color="#5A2E0E" />
              </View>
              <View>
                <Text style={styles.buttonText}>Mã Code</Text>
                <Text style={styles.text}>Nhập mã Code có trên vé</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => NavigationServices.navigate("History")}
            >
              <View style={styles.iconWrapper}>
                <Icon name="history" size={18} color="#5A2E0E" />
              </View>
              <View>
                <Text style={styles.buttonText}>Lịch sử</Text>
                <Text style={styles.text}>Tra cứu thông tin lịch sử</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleDeleteAccount}
            >
              <View style={styles.iconWrapper}>
                <Icon name="remove" size={18} color="#5A2E0E" />
              </View>
              <View>
                <Text style={styles.buttonText}>Tài khoản</Text>
                <Text style={styles.text}>Yêu cầu xoá tài khoản</Text>
              </View>
            </TouchableOpacity>
          </View>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#5A2E0E",
  },
  header: {
    height: 100,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  title_top: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
  },
  title: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#5A2E0E",
  },
  titleclb: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#5A2E0E",
  },
  subtitle: {
    fontSize: 14,
    color: "#9E5D2D",
    fontWeight: "400",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5A2E0E",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  text: {
    color: "white",
    fontSize: 13,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
});
