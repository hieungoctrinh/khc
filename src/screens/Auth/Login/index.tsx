import React, { useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  BackHandler,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccountLoginMutation } from "@redux/features/account/accountApi";
import NavigationServices from "@navigation/NavigationServices";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { IAppData } from "@redux/store";

const LoginScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [accountLogin, { isLoading }] = useAccountLoginMutation();
  const [apiError, setApiError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const route = useRoute();
  const { logo, endpoint } = useSelector((state: IAppData) => state.app);

  console.log("endpoint----2", endpoint);

  const onSubmit = async (data: any) => {
    try {
      const result = await accountLogin(data).unwrap();
      await AsyncStorage.setItem("user", JSON.stringify(result));
    } catch (err: any) {
      setApiError(err?.data?.message || "Đăng nhập thất bại");
    }
  };

  console.log("logo", logo);

  const handleExit = () => {
    Alert.alert(
      "Xác nhận thoát",
      "Bạn có chắc muốn thoát khỏi CLB này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "OK",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              console.log("🧹 Storage cleared");
              NavigationServices.replace("CheckinEndpoint");
            } catch (error) {
              console.log("❌ Lỗi khi clear storage:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleExit();
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.whiteContainer}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Icon name="sign-out" size={24} color="#5A2E0E" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image source={{ uri: logo }} style={styles.logo} />
          </View>

          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục sử dụng ứng dụng.
          </Text>

          {/* Email */}
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email là bắt buộc",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không hợp lệ",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View style={styles.inputContainer}>
                  <Icon
                    name="envelope"
                    size={18}
                    color="#5A2E0E"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#BDB7AF"
                    keyboardType="email-address"
                    onBlur={() => {
                      onChange(value?.trim());
                      onBlur();
                    }}
                    onChangeText={(text) => {
                      setApiError("");
                      onChange(text.trim());
                    }}
                    value={value}
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>
                    {errors.email.message?.toString()}
                  </Text>
                )}
              </>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Mật khẩu là bắt buộc",
              minLength: { value: 6, message: "Mật khẩu ít nhất 6 ký tự" },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View style={styles.inputContainer}>
                  <Icon
                    name="lock"
                    size={18}
                    color="#5A2E0E"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#BDB7AF"
                    secureTextEntry={!showPassword}
                    onBlur={() => {
                      onChange(value?.trim());
                      onBlur();
                    }}
                    onChangeText={(text) => {
                      setApiError("");
                      onChange(text.trim());
                    }}
                    value={value}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ marginLeft: 10 }}
                  >
                    <Icon
                      name={showPassword ? "eye" : "eye-slash"}
                      size={18}
                      color="#5A2E0E"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message?.toString()}
                  </Text>
                )}
              </>
            )}
          />

          {apiError && <Text style={styles.errorText}>{apiError}</Text>}

          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
            </TouchableOpacity>

            {/* <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#5A2E0E",
                textAlign: "center",
                marginTop: 10,
              }}
              onPress={() => NavigationServices.replace("ResgisterScreen")}
            >
              Đăng ký
            </Text> */}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#5A2E0E",
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
    overflow: "hidden",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5A2E0E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9E5D2D",
    marginBottom: 20,
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EBE5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#5A2E0E",
    height: 50,
  },
  button: {
    backgroundColor: "#5A2E0E",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  exitButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  exitText: {
    color: "#5A2E0E",
    fontWeight: "600",
    marginLeft: 6,
  },
});
