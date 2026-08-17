import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { ClerkConvexProvider } from "@/providers/ClerkConvexProvider";
import { PlannerHomeScreen } from "@/features/planner/screens/PlannerHomeScreen";

export default function App() {
  return (
    <ClerkConvexProvider>
      <SafeAreaView style={styles.root}>
        <PlannerHomeScreen />
        <StatusBar style="auto" />
      </SafeAreaView>
    </ClerkConvexProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
