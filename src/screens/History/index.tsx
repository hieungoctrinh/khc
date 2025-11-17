import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import NavigationServices from "@navigation/NavigationServices";
import { useGetCheckinLogsQuery } from "@redux/features/ticket/ticketApi";
import { formatDate, formatTime } from "@themes/constants";
import { useSelector } from "react-redux";
import { IAppData } from "@redux/store";

const PAGE_LIMIT = 10;

const History = () => {
  const [offset, setOffset] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const appData = useSelector((state: IAppData) => state);
  const token = appData.account.token;
  console.log("TOKEN CURRENT:", token);

  const { data, isFetching, isError, refetch } = useGetCheckinLogsQuery({
    limit: PAGE_LIMIT,
    offset,
  });

  // Khi data thay đổi → nối thêm dữ liệu mới
  useEffect(() => {
    if (data?.items) {
      setLogs((prev) => {
        if (offset === 0) return data.items;

        // Lọc trùng theo id
        const newItems = data.items.filter(
          (item: any) => !prev.some((old) => old.id === item.id)
        );
        return [...prev, ...newItems];
      });

      // Kiểm tra còn dữ liệu không
      const total = data.meta?.total ?? 0;
      const current = (offset ?? 0) + (data.items?.length ?? 0);
      setHasMore(current < total);
    }
  }, [data, offset]);

  const loadMore = () => {
    if (isFetching || !hasMore) return;
    setOffset((prev) => prev + PAGE_LIMIT);
  };

  const onRefresh = async () => {
    setHasMore(true);

    if (offset === 0) {
      // chỉ xóa và cập nhật sau khi gọi lại API thành công
      const result = await refetch();
      if (result?.data?.items) {
        setLogs(result.data.items);
      }
    } else {
      setOffset(0);
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

  const getCheckinStatus = (status: string) => {
    switch (status) {
      case "checked_in":
        return "Đã check-in";
      case "pending":
        return "Chưa check-in";
      default:
        return "Không xác định";
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const info = item.data;
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Text style={styles.label}>Mã vé : </Text>
            <Text style={styles.ticketCode}>{info.ticketCode}</Text>
          </View>
          <Text style={styles.time}>
            {new Date(info.checkinAt).toLocaleString("vi-VN")}
          </Text>
        </View>

        <Text style={styles.match}>{info.matchName}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Họ và tên: </Text>
          <Text style={styles.value}>
            {info.customerFamilyName || info.customerFirstName
              ? `${info.customerFamilyName ?? ""} ${info.customerFirstName ?? ""}`.trim()
              : "Khách lẻ"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cổng: </Text>
          <Text style={styles.value}>{info.gateName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Khán đài: </Text>
          <Text style={styles.value}>{info.standName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thời gian trận đấu: </Text>
          <Text style={styles.value}>
            {formatTime(info.matchTime)} - {formatDate(info.matchDate)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái trận đấu: </Text>
          <Text style={styles.value}>
            {getMatchStatusLabel(info.matchStatus)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái Check-in: </Text>
          <Text style={styles.value}>
            {getCheckinStatus(info.checkinStatus)}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (isFetching && offset > 0) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color="#5C3317" />
        </View>
      );
    }
    if (!hasMore) {
      return (
        <Text
          style={{ textAlign: "center", color: "#999", paddingVertical: 10 }}
        >
          Đã tải hết dữ liệu
        </Text>
      );
    }
    return null;
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

        <Text style={styles.headerTitle}>Lịch sử Check-in</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isError ? (
          <Text style={{ color: "red", textAlign: "center" }}>
            Lỗi khi tải dữ liệu!
          </Text>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshing={isFetching && offset === 0}
            onRefresh={onRefresh}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default History;

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
    padding: 16,
  },
  card: {
    backgroundColor: "#F8F4F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  ticketCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5C3317",
  },
  time: {
    paddingVertical: 4,
    fontSize: 14,
    color: "#666",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  match: {
    fontSize: 16,
    color: "#5C3317",
    marginBottom: 4,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5C3317",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
});
