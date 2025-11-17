import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Linking,
  Modal,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import NavigationServices from "@navigation/NavigationServices";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import { IAppData } from "@redux/store";
import { useSelector } from "react-redux";
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

const { width: screenWidth } = Dimensions.get("window");

const getCheckinStatus = (matchDate?: string, matchTime?: string) => {
  if (!matchDate || !matchTime) return "invalid";

  const matchDateTime = new Date(`${matchDate}T${matchTime}`);
  const now = new Date();

  const matchDateOnly = matchDateTime.toDateString();
  const nowDateOnly = now.toDateString();

  if (nowDateOnly === matchDateOnly) {
    // 🟢 Cùng ngày -> Cho check-in
    return "available";
  } else if (now < matchDateTime) {
    // ⏳ Trước ngày -> Chưa tới giờ check-in
    return "too_early";
  } else {
    // ⛔ Sau ngày -> Quá hạn
    return "expired";
  }
};

const QrScan = () => {
  const device = useCameraDevice("back");
  const token = useSelector((state: IAppData) => state.account.token);

  const [hasPermission, setHasPermission] = useState(false);

  const lastScannedAt = useRef<number>(0);

  const backLock = useRef(false);

  const [checkTicket, { isLoading: checking }] = useCheckTicketMutation();
  const [confirmCheckin, { isLoading: confirming }] =
    useConfirmCheckinMutation();
  // === unified flow ===
  const [flowStep, setFlowStep] = useState<
    "idle" | "checking" | "checkResult" | "confirming" | "finalResult"
  >("idle");

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    ticket?: any;
  }>({ success: false, message: "", ticket: null });

  // ==== FORMAT ====
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("vi-VN").format(new Date(dateString));
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    return `${hour}:${minute}`;
  };

  // ====== B1: SCAN & CHECK TICKET ======
  const handleScan = async (qrValue: string) => {
    if (!qrValue || flowStep !== "idle") return;
    setFlowStep("checking");

    try {
      const resData = await checkTicket(qrValue).unwrap(); // ✅ Gọi mutation
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

  // ====== B2: XÁC NHẬN CHECKIN ======
  const onConfirmCheckin = async () => {
    if (!result.ticket?.ticketCode) return;
    setFlowStep("confirming");
    try {
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

  const resetFlow = () => {
    setFlowStep("idle");
    setResult({ success: false, message: "", ticket: null });
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

  const getMatchStatusLabel = (status: string) => {
    switch (status) {
      case "open_sale":
        return "Đang mở bán";
      case "draft":
        return "Nháp";
      case "completed":
        return "Đã diễn ra";
      case "cancelled":
        return "Đã huỷ";
      case "close_sale":
        return "Đã đóng bán";
      default:
        return "Không xác định";
    }
  };

  // ====== SCANNER ======
  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      try {
        const now = Date.now();
        if (codes.length === 0 || flowStep !== "idle") return;

        const qrValue = codes[0].value;
        if (!qrValue) return;

        // 🔸 Chống quét trùng trong vòng 1.5 giây
        if (now - lastScannedAt.current < 1500) return;
        lastScannedAt.current = now;

        handleScan(qrValue);
      } catch (err) {
        console.warn("⚠️ QR scan error:", err);
      }
    },
  });

  // ====== QUYỀN CAMERA ======
  const checkAndRequestPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Quyền truy cập Camera",
          message: "Ứng dụng cần quyền camera để quét mã QR.",
          buttonNeutral: "Hỏi sau",
          buttonNegative: "Huỷ",
          buttonPositive: "Đồng ý",
        }
      );
      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === "granted");
    }
  };

  useEffect(() => {
    checkAndRequestPermission();

    return () => {
      // 🔸 cleanup để camera không crash khi rời màn hình
      setHasPermission(false);
    };
  }, []);

  if (device == null) return <Text>Đang tải camera...</Text>;

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          Bạn chưa cấp quyền sử dụng camera.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Linking.openSettings()}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Mở cài đặt</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====== UI ======
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (backLock.current) return;
            backLock.current = true;
            setTimeout(() => (backLock.current = false), 500); // 0.5s unlock
            NavigationServices.goBack();
          }}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét QR Code</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Camera */}
      <View style={styles.content}>
        <View style={styles.scanBox} />
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={flowStep === "idle"}
          codeScanner={codeScanner}
        />
      </View>

      {/* Modal flow */}
      <Modal transparent visible={flowStep !== "idle"} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {flowStep === "checking" && (
              <>
                <ActivityIndicator color="#5C3317" size="large" />
                <Text style={{ marginTop: 16 }}>Đang kiểm tra vé...</Text>
              </>
            )}

            {flowStep === "checkResult" && (
              <>
                <Icon
                  name={result.success ? "check-circle" : "exclamation-circle"}
                  size={40}
                  color={result.success ? "green" : "#E6A700"}
                />
                <Text style={styles.modalTitle}>{result.message}</Text>
                {result.ticket && (
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
                      <Text style={styles.label}>Họ và tên: </Text>
                      <Text style={styles.value}>
                        {result.ticket.customerFirstName &&
                        result.ticket.customerFamilyName
                          ? `${result.ticket.customerFirstName} ${result.ticket.customerFamilyName}`
                          : "Khách lẻ"}
                      </Text>
                    </View>
                  </View>
                )}

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
                  <Text>Quét vé khác</Text>
                </TouchableOpacity>
              </>
            )}

            {flowStep === "confirming" && (
              <>
                <ActivityIndicator color="#5C3317" size="large" />
                <Text style={{ marginTop: 16 }}>Đang xác nhận check-in...</Text>
              </>
            )}

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

export default QrScan;

// ====== STYLE ======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5C3317" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#5C3317",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
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
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderWidth: 2,
    borderColor: "#FF0000",
    borderRadius: 10,
    position: "absolute",
  },
  permissionButton: {
    backgroundColor: "#5C3317",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
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
  ticketInfo: { marginVertical: 10, alignItems: "flex-start", gap: 4 },
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
  infoRow: { flexDirection: "row", width: "100%" },
  label: { fontWeight: "600", color: "#5C3317", flex: 3 },
  value: { flex: 5, color: "#333", flexWrap: "wrap", fontWeight: "700" },
});
