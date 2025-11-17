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
import { useRegisterAccountMutation } from "@redux/features/account/accountApi";
import NavigationServices from "@navigation/NavigationServices";

const ResgisterScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [accountRegister, { isLoading }] = useRegisterAccountMutation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const onSubmit = async (data: any) => {
    try {
      const result = await accountRegister(data).unwrap();
      Alert.alert(
        "Thành công",
        `${result.message} Quản trị viên sẽ xem xét và xử lý trong thời gian sớm nhất` ||
          "Đăng ký thành công!",
        [
          {
            text: "OK",
            onPress: () => {
              NavigationServices.navigate("LoginScreen");
            },
          },
        ]
      );
      await AsyncStorage.setItem("user", JSON.stringify(result));
    } catch (err: any) {
      setApiError(err?.data?.message || "Đăng ký thất bại");
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.whiteContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>
            Điền thông tin để gửi yêu cầu tạo tài khoản.
          </Text>

          <Controller
            control={control}
            name="firstName"
            rules={{
              required: "Họ là bắt buộc",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View style={styles.inputContainer}>
                  <Icon
                    name="user"
                    size={18}
                    color="#5A2E0E"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Họ"
                    placeholderTextColor="#BDB7AF"
                    keyboardType="email-address"
                    onBlur={() => {
                      onChange(value?.trim());
                      onBlur();
                    }}
                    onChangeText={(text) => {
                      setApiError("");
                      onChange(text.trimStart());
                    }}
                    value={value}
                    autoCapitalize="none"
                  />
                </View>
                {errors.firstName && (
                  <Text style={styles.errorText}>
                    {errors.firstName.message?.toString()}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="familyName"
            rules={{
              required: "Tên là bắt buộc",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View style={styles.inputContainer}>
                  <Icon
                    name="user"
                    size={18}
                    color="#5A2E0E"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tên"
                    placeholderTextColor="#BDB7AF"
                    keyboardType="email-address"
                    onBlur={() => {
                      onChange(value?.trim());
                      onBlur();
                    }}
                    onChangeText={(text) => {
                      setApiError("");
                      onChange(text.trimStart());
                    }}
                    value={value}
                    autoCapitalize="none"
                  />
                </View>
                {errors.familyName && (
                  <Text style={styles.errorText}>
                    {errors.familyName.message?.toString()}
                  </Text>
                )}
              </>
            )}
          />

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
                      onChange(text.trimStart());
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
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      setApiError("");
                      onChange(text);
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

          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: "Số điện thoại là bắt buộc",
              minLength: { value: 10, message: "Số điện thoại ít nhất 10 số" },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View style={styles.inputContainer}>
                  <Icon
                    name="phone"
                    size={18}
                    color="#5A2E0E"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    placeholderTextColor="#BDB7AF"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9]/g, "");
                      setApiError("");
                      onChange(text);
                    }}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="numeric"
                  />
                </View>
                {errors.phoneNumber && (
                  <Text style={styles.errorText}>
                    {errors.phoneNumber.message?.toString()}
                  </Text>
                )}
              </>
            )}
          />

          {apiError && <Text style={styles.errorText}>{apiError}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Đăng kí</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ResgisterScreen;

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
    marginTop: 100,
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
  backButton: {
    position: "absolute",
    left: 16,
    top: 60,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
