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
import NavigationServices from "@navigation/NavigationServices";

const RegisterDomain = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [apiError, setApiError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const onSubmit = async (data: any) => {
    try {
      setApiError("");

      const res = await fetch(
        //"https://checkin-worker.huydevdigital.workers.dev/register",
        "https://checkin.khc.workers.dev/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_name: data.club_name,
            domain: data.domain,
            passcode: data.passcode,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setApiError(result?.message || "Đăng ký thất bại");
        return;
      }

      Alert.alert(
        "Thành công",
        "Yêu cầu đăng ký đã được gửi. Quản trị viên sẽ xử lý sớm nhất.",
        [
          {
            text: "OK",
            onPress: () => NavigationServices.replace("CheckinEndpoint"),
          },
        ]
      );
    } catch {
      setApiError("Có lỗi xảy ra. Vui lòng thử lại.");
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
          <View
            style={{
              flexDirection: "row",

              marginTop: 100,
            }}
          >
            <TouchableOpacity onPress={() => NavigationServices.goBack()}>
              <Icon name="arrow-left" size={26} color="#5A2E0E"></Icon>
            </TouchableOpacity>
            <Text style={styles.title}>Yêu cầu đăng ký</Text>
          </View>

          <Text style={styles.subtitle}>
            Điền thông tin để gửi yêu cầu tạo tên miền CLB.
          </Text>

          <Controller
            control={control}
            name="club_name"
            rules={{
              required: "Tên CLB là bắt buộc",
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
                    placeholder="Tên CLB"
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
                {errors.club_name && (
                  <Text style={styles.errorText}>
                    {errors.club_name.message?.toString()}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="domain"
            rules={{
              required: "Tên miền là bắt buộc",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View style={styles.inputContainer}>
                  <Icon
                    name="globe"
                    size={18}
                    color="#5A2E0E"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tên miền"
                    placeholderTextColor="#BDB7AF"
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
                {errors.domain && (
                  <Text style={styles.errorText}>
                    {errors.domain.message?.toString()}
                  </Text>
                )}
              </>
            )}
          />

          {/* Passcode */}
          <Controller
            control={control}
            name="passcode"
            rules={{
              required: "Mã PIN là bắt buộc",
              minLength: { value: 6, message: "Mã PIN ít nhất 6 ký tự" },
              pattern: {
                value: /^[0-9]+$/,
                message: "Chỉ được nhập số",
              },
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
                    placeholder="Mã PIN"
                    placeholderTextColor="#BDB7AF"
                    secureTextEntry={!showPassword}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      setApiError("");
                      onChange(text.trimStart());
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
                {errors.passcode && (
                  <Text style={styles.errorText}>
                    {errors.passcode.message?.toString()}
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
            <Text style={styles.buttonText}>Đăng ký</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterDomain;

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
    marginLeft: 30,
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
