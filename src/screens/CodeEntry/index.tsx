import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import Icon from "react-native-vector-icons/FontAwesome";
import NavigationServices from "@navigation/NavigationServices";
import { useSelector } from "react-redux";
import { IAppData } from "@redux/store";
import {
  useCheckTicketMutation,
  useConfirmCheckinMutation,
} from "@redux/features/ticket/ticketApi";
import Sound from "react-native-sound";

Sound.setCategory("Playback");

const playSound = (type: "success" | "error") => {
  console.log("🔔 GỌI playSound với type:", type);

  const soundName = type === "success" ? "success" : "error";
  const sound = new Sound(soundName + ".mp3", Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log("❌ Lỗi tải âm thanh:", error);
      return;
    }
    console.log("✅ Âm thanh tải thành công:", soundName);
    sound.play((success) => {
      if (success) console.log("🎧 Phát âm thanh thành công");
      else console.log("⚠️ Phát âm thanh thất bại");
      sound.release();
    });
  });
};

type FormValues = { ticketCode: string };

const CodeEntry = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const codeValue = watch("ticketCode");
  const token = useSelector((state: IAppData) => state.account.token);
  const endpoint = useSelector((state: IAppData) => state.app.endpoint);
  const [checkTicket, { isLoading: checking }] = useCheckTicketMutation();
  const [confirmCheckin, { isLoading: confirming }] =
    useConfirmCheckinMutation();

  const [flowStep, setFlowStep] = useState<
    "idle" | "checking" | "checkResult" | "confirming" | "finalResult"
  >("idle");
  console.log("endpoint----", endpoint);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    ticket?: any;
  }>({ success: false, message: "", ticket: null });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("vi-VN").format(new Date(dateString));
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    return `${hour}:${minute}`;
  };

  const getTicketTypeLabel = (type: string) => {
    switch (type) {
      case "standard":
        return "Vé thường";
      case "vip":
        return "Vé VIP";
      default:
        return "Không xác định";
    }
  };

  // 🧩 Hàm kiểm tra trạng thái checkin (sớm, hợp lệ, trễ)
  const getCheckinStatus = (matchDate?: string, matchTime?: string) => {
    if (!matchDate || !matchTime) return "invalid";

    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    const now = new Date();

    const matchDateOnly = matchDateTime.toDateString();
    const nowDateOnly = now.toDateString();

    if (nowDateOnly === matchDateOnly) {
      return "available";
    } else if (now < matchDateTime) {
      return "too_early";
    } else {
      return "expired";
    }
  };

  // 🧩 B1: Kiểm tra vé
  const onCheckTicket = async (data: FormValues) => {
    const code = data.ticketCode.trim();
    if (!code) return;

    setFlowStep("checking");
    try {
      const resData = await checkTicket(code).unwrap();
      console.log("🔎 Check ticket:", resData);

      if (
        resData.checkinStatus === "checked_in" ||
        (resData.matchStatus !== "open_sale" &&
          resData.matchStatus !== "close_sale")
      ) {
        playSound("error");
        setResult({
          success: false,
          message:
            resData.checkinStatus === "checked_in"
              ? "Vé này đã được check-in!"
              : "Trận đấu này không còn hợp lệ để check-in!",
          ticket: resData,
        });
        setFlowStep("checkResult");
        return;
      }

      if (!resData?.id) {
        playSound("error");
        setResult({
          success: false,
          message: resData?.message || "Vé không hợp lệ!",
          ticket: null,
        });

        setFlowStep("checkResult");
        return;
      }

      // ✅ Kiểm tra trạng thái check-in
      const status = getCheckinStatus(resData.matchDate, resData.matchTime);
      if (status === "available") {
      } else {
        playSound("error");
      }
      let message = "";
      switch (status) {
        case "too_early":
          message = "Vé chưa tới giờ check-in.";
          break;
        case "expired":
          message = "Vé đã quá hạn check-in.";
          break;
        case "available":
          message = "Vé hợp lệ!";
          break;
        default:
          message = "Thông tin vé không hợp lệ.";
      }

      setResult({
        success: status === "available",
        message,
        ticket: resData,
      });
      setFlowStep("checkResult");
    } catch (error: any) {
      console.log("❌ Check ticket error:", error);
      playSound("error");
      setResult({
        success: false,
        message: error?.data?.message || "Có lỗi xảy ra khi kiểm tra vé!",
        ticket: null,
      });
      setFlowStep("checkResult");
    }
  };

  // 🧩 B2: Xác nhận check-in
  const onConfirmCheckin = async () => {
    if (!result.ticket?.ticketCode) return;
    setFlowStep("confirming");

    try {
      // ✅ Gọi mutation confirmCheckin (POST)
      const resData = await confirmCheckin(result.ticket.ticketCode).unwrap();
      console.log("✅ Confirm check-in:", resData);

      setResult({
        success: true,
        message: resData?.message || "Check-in thành công!",
      });
      playSound("success");
    } catch (error: any) {
      console.log("❌ Confirm check-in error:", error);
      setResult({
        success: false,
        message: error?.data?.message || "Check-in thất bại!",
      });
      playSound("error");
    } finally {
      setFlowStep("finalResult");
    }
  };

  // 🧩 Reset để nhập vé mới
  const resetFlow = () => {
    setFlowStep("idle");
    setResult({ success: false, message: "", ticket: null });
  };

  // 🧩 Helper hiển thị tên khách hàng
  const getCustomerName = (familyName?: string, firstName?: string) => {
    const fullName =
      `${familyName?.trim() || ""} ${firstName?.trim() || ""}`.trim();
    return fullName || "Khách lẻ";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={NavigationServices.goBack}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập mã Code</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.helperText}>
          Nhập mã code trên vé để kiểm tra thông tin
        </Text>

        <Controller
          control={control}
          name="ticketCode"
          rules={{ required: "Code là bắt buộc" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Icon
                name="hashtag"
                size={18}
                color="#5C3317"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mã Code"
                placeholderTextColor="#888"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />

        <TouchableOpacity
          style={[
            styles.buttonCheck,
            { backgroundColor: codeValue ? "#5A2E0E" : "#A1887F" },
          ]}
          onPress={handleSubmit(onCheckTicket)}
          disabled={!codeValue || flowStep !== "idle"}
        >
          {flowStep === "checking" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kiểm tra</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 🔥 Modal flow */}
      <Modal transparent visible={flowStep !== "idle"} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Đang kiểm tra */}
            {flowStep === "checking" && (
              <>
                <ActivityIndicator color="#5C3317" size="large" />
                <Text style={{ marginTop: 16 }}>Đang kiểm tra vé...</Text>
              </>
            )}

            {/* Kết quả kiểm tra vé */}
            {flowStep === "checkResult" &&
              (result.ticket ? (
                <>
                  <Icon
                    name={
                      result.success ? "check-circle" : "exclamation-circle"
                    }
                    size={40}
                    color={result.success ? "green" : "#E6A700"}
                  />
                  <Text style={styles.modalTitle}>{result.message}</Text>

                  <View style={styles.ticketInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Trận đấu:</Text>
                      <Text style={styles.value}>
                        {result.ticket.matchName}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Ngày:</Text>
                      <Text style={styles.value}>
                        {formatTime(result.ticket.matchTime)} -{" "}
                        {formatDate(result.ticket.matchDate)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Loại vé:</Text>
                      <Text style={styles.value}>
                        {getTicketTypeLabel(result.ticket.ticketType)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Khán đài:</Text>
                      <Text style={styles.value}>
                        {result.ticket.standName}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Cổng:</Text>
                      <Text style={styles.value}>{result.ticket.gateName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Họ tên:</Text>
                      <Text style={styles.value}>
                        {result.ticket?.customerFirstName &&
                        result.ticket?.customerFamilyName
                          ? `${result.ticket.customerFirstName} ${result.ticket.customerFamilyName}`
                          : "Khách lẻ"}
                      </Text>
                    </View>
                  </View>

                  {result.success && (
                    <TouchableOpacity
                      style={styles.modalButtonDark}
                      onPress={onConfirmCheckin}
                    >
                      <Text style={{ color: "#fff" }}>Xác nhận vào cổng</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.modalButtonLight}
                    onPress={resetFlow}
                  >
                    <Text>Nhập vé khác</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Icon name="times-circle" size={40} color="red" />
                  <Text style={styles.modalTitle}>Không hợp lệ!</Text>
                  <Text style={styles.modalMessage}>{result.message}</Text>
                  <TouchableOpacity
                    style={styles.modalButtonLight}
                    onPress={resetFlow}
                  >
                    <Text>Thử lại</Text>
                  </TouchableOpacity>
                </>
              ))}

            {/* Đang xác nhận checkin */}
            {flowStep === "confirming" && (
              <>
                <ActivityIndicator color="#5C3317" size="large" />
                <Text style={{ marginTop: 16 }}>Đang xác nhận check-in...</Text>
              </>
            )}

            {/* Kết quả cuối */}
            {flowStep === "finalResult" && (
              <>
                <Icon
                  name={result.success ? "check-circle" : "times-circle"}
                  size={40}
                  color={result.success ? "green" : "red"}
                />
                <Text style={styles.modalTitle}>
                  {result.success ? "Thành công!" : "Thất bại!"}
                </Text>
                <Text style={styles.modalMessage}>{result.message}</Text>
                <TouchableOpacity
                  style={styles.modalButtonLight}
                  onPress={resetFlow}
                >
                  <Text>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CodeEntry;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5C3317" },
  header: {
    backgroundColor: "#5C3317",
    flexDirection: "row", // 👈 nằm cùng hàng
    alignItems: "center", // 👈 căn giữa theo chiều dọc
    justifyContent: "center", // 👈 căn giữa tiêu đề
    paddingTop: 70, // chừa vùng notch/iPhone
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  helperText: {
    marginTop: 50,
    textAlign: "center",
    color: "#5C3317",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2EFEC",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 50,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#000", height: 50 },
  buttonCheck: { paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
  modalMessage: { textAlign: "center", color: "#5C3317", marginBottom: 20 },
  ticketInfo: {
    marginVertical: 10,
    alignItems: "flex-start",
    gap: 4,
    width: "100%",
  },
  modalButtonLight: {
    backgroundColor: "#F2EFEC",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
    width: "100%",
  },
  modalButtonDark: {
    backgroundColor: "#5A2E0E",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    width: "100%",
  },
  label: {
    fontWeight: "600",
    color: "#5C3317",
    flex: 3,
  },
  value: {
    flex: 5,
    color: "#333",
    flexWrap: "wrap",
    fontWeight: "700",
  },
});
