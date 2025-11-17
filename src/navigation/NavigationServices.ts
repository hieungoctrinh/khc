// src/navigation/NavigationService.ts
import { navigationRef, RootStackParamList } from '@navigation/RootNavigation'
import { StackActions, CommonActions } from '@react-navigation/native'

// Điều hướng đến màn hình bất kỳ
function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  }
}

// Quay lại màn hình trước
function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack()
  }
}

// Đặt lại toàn bộ stack và điều hướng đến màn hình mới
function reset(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }]
      })
    )
  }
}

// Đẩy một màn hình mới vào stack (tương tự như navigate nhưng không thay thế)
function push<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params))
  }
}

// Thay thế màn hình hiện tại bằng màn hình mới
// NavigationServices.ts
function replace<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      })
    );
  }
}


// Quay lại một số lượng màn hình trong stack
function pop(count = 1) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(count))
  }
}

// Quay về màn hình gốc của stack (đầu tiên trong stack)
function popToTop() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.popToTop())
  }
}

export default {
  navigate,
  goBack,
  reset,
  push,
  replace,
  pop,
  popToTop
}
