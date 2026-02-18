import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favoritos</Text>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Aún no has marcado recetas como favoritas.
        </Text>
        <Text style={styles.infoText}>
          En el futuro puedes añadir aquí un sistema para guardar recetas
          favoritas en tu backend o en el almacenamiento local.
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
