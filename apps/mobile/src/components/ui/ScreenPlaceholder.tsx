import { StyleSheet, Text, View } from "react-native";

/**
 * Temporary scaffold placeholder for a mobile feature screen.
 * Replaced by real implementation as each slice is built (see build order in CLAUDE.md).
 */
export function ScreenPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },
});
