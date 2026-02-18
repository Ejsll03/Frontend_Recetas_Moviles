import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

export default function FavoritesScreen({ apiUrl, setLoading }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/recipes/favorites`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setFavorites(data);
        }
      } catch (error) {
        console.warn("Error cargando favoritos", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [apiUrl, setLoading]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      {item.user?.username && (
        <Text style={styles.author}>por {item.user.username}</Text>
      )}
      {!!item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favoritos</Text>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aún no has marcado recetas como favoritas.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#0b1120",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#d1d5db",
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
});
