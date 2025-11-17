import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Pressable,
  BackHandler,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch } from "react-redux";
import { setClubInfo, setEndpoint } from "@redux/features/app/appSlice";
import NavigationServices from "@navigation/NavigationServices";
import { useFocusEffect } from "@react-navigation/native";

interface FormValues {
  domain: string;
  password: string;
}

const CheckinEndpoint = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>();

  const dispatch = useDispatch();

  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [endpoint, setEndpointState] = useState<string | null>(null);
  const [loadingEndpoint, setLoadingEndpoint] = useState(false);
  const [endpointError, setEndpointError] = useState("");

  const fetchEndpoint = async () => {
    const { domain, password } = getValues();

    if (!domain || !password) {
      setEndpointError("Vui lòng nhập đầy đủ tên miền và mã PIN.");
      return;
    }

    try {
      setLoadingEndpoint(true);
      setEndpointError("");
      setEndpointState(null);

      const res = await fetch(
        //"https://checkin-worker.huydevdigital.workers.dev/",
        "https://checkin.khc.workers.dev/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain,
            passcode: password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data?.endpoint) {
        dispatch(setEndpoint(data.endpoint));
        dispatch(setClubInfo({ logo: data.logo, clubName: data.clubName }));
        setEndpointState(data.endpoint);

        NavigationServices.navigate("LoginScreen");
      } else {
        setEndpointError(
          data?.error || data?.message || "Không tìm thấy endpoint hợp lệ"
        );
      }
    } catch (err) {
      setEndpointError("Vui lòng thử lại.");
    } finally {
      setLoadingEndpoint(false);
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
          <Text style={styles.title}>Cấu hình điểm Check-in</Text>
          <Text style={styles.subtitle}>
            Nhập thông tin CLB để kết nối hệ thống.
          </Text>

          {/* Domain */}
          <Controller
            control={control}
            name="domain"
            rules={{ required: "Tên miền là bắt buộc" }}
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
                    placeholder="Tên miền CLB "
                    placeholderTextColor="#BDB7AF"
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
                {errors.domain && (
                  <Text style={styles.errorText}>
                    {errors.domain.message?.toString()}
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
              required: "Mã PIN là bắt buộc",
              minLength: { value: 6, message: "Mã PIN ít nhất 6 ký tự" },
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
          {endpointError ? (
            <Text style={[styles.errorText, { marginTop: -5 }]}>
              {endpointError}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={fetchEndpoint}
            disabled={loadingEndpoint}
          >
            {loadingEndpoint ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tiếp tục</Text>
            )}
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: "#5A2E0E",
              }}
            >
              Đăng ký CLB mới?
            </Text>
            <Pressable
              onPress={() => NavigationServices.navigate("RegisterDomain")}
              style={{
                paddingHorizontal: 5,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",

                  color: "#9E5D2D",
                }}
              >
                Đăng ký
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CheckinEndpoint;

// --- Styles giữ nguyên ---
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#5A2E0E" },
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5A2E0E",
    marginBottom: 8,
    marginTop: 100,
  },
  subtitle: {
    fontSize: 14,
    color: "#9E5D2D",
    marginBottom: 20,
    fontWeight: "400",
  },
  endpointContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F7F2ED",
    borderRadius: 12,
  },
  endpointLabel: { fontSize: 14, color: "#5A2E0E", fontWeight: "600" },
  endpointText: { fontSize: 13, color: "#007bff", marginTop: 4 },
  endpointError: { fontSize: 13, color: "red", marginTop: 4 },
  endpointPlaceholder: { fontSize: 13, color: "#BDB7AF", marginTop: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EBE5",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 50,
    marginBottom: 15,
  },
  icon: { marginRight: 10 },
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
  buttonText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
  errorText: { color: "red", fontSize: 12, marginBottom: 10 },
});
