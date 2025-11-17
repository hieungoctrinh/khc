import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useSelector } from "react-redux";
import { ActivityIndicator, View } from "react-native";

import LoginScreen from "@screens/Auth/Login";
import HomeScreen from "@screens/HomeScreen";
import QrScan from "@screens/QrScan";
import CodeEntry from "@screens/CodeEntry";
import History from "@screens/History";
import CheckinEndpoint from "@screens/Auth/Checkin";
import ResgisterScreen from "@screens/Auth/Resgister";
import RegisterDomain from "@screens/Auth/RegisterDomain";
import BeginScreen from "@screens/Auth/Begin";

export type RootStackParamList = {
  App: undefined;
  LoginScreen: { logo: string; clubName: string };
  RegisterScreen: undefined;
  HomeScreen: undefined;
  QrScan: undefined;
  CodeEntry: undefined;
  History: undefined;
  CheckinEndpoint: undefined;
  ResgisterScreen: undefined;
  RegisterDomain: undefined;
  BeginScreen: undefined;
};

const appStartTime = Date.now();

const Stack = createStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const TransitionScreenOptions = {
  ...TransitionPresets.SlideFromRightIOS,
  headerShown: false,
};

export const RootNavigation = () => {
  const loadTime = (Date.now() - appStartTime) / 1000;
  console.log("App load time:", loadTime, "seconds");

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="BeginScreen"
        screenOptions={TransitionScreenOptions}
      >
        <Stack.Screen
          name="BeginScreen"
          component={BeginScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="QrScan" component={QrScan} />
        <Stack.Screen name="CodeEntry" component={CodeEntry} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen
          name="CheckinEndpoint"
          component={CheckinEndpoint}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="ResgisterScreen" component={ResgisterScreen} />
        <Stack.Screen name="RegisterDomain" component={RegisterDomain} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
