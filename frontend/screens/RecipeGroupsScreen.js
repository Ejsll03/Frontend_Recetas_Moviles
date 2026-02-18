import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RecipeGroupsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grupos de recetas</Text>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Todavía no tienes grupos creados.</Text>
        <Text style={styles.infoText}>
          Aquí podrías mostrar y gestionar grupos de recetas usando el modelo
          RecipeGroup del backend.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: "#e5e7eb",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  infoText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
  },
});
