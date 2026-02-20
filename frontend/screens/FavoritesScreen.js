import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function FavoritesScreen({ apiUrl, setLoading, onDetailOpen }) {
  const [favorites, setFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [mode, setMode] = useState("list"); // list | detail
  const [favoriteIds, setFavoriteIds] = useState([]);

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
          const sorted = [...data].sort((a, b) => {
            const ta = (a.title || "").toLowerCase();
            const tb = (b.title || "").toLowerCase();
            return ta.localeCompare(tb);
          });
          setFavorites(sorted);
          setFavoriteIds(sorted.map((r) => r._id));
        }
      } catch (error) {
        console.warn("Error cargando favoritos", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [apiUrl, setLoading]);

  const openDetail = (recipe) => {
    setSelectedRecipe(recipe);
    setMode("detail");
    if (onDetailOpen) {
      onDetailOpen();
    }
  };

  const toggleFavorite = async (recipeId) => {
    try {
      const res = await fetch(`${apiUrl}/recipes/${recipeId}/favorite`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return;

      setFavoriteIds((prev) =>
        data.isFavorite
          ? [...prev, recipeId]
          : prev.filter((id) => id !== recipeId)
      );

      // Si se desmarca como favorito desde el detalle, quitarlo de la lista y volver a la vista de lista
      if (!data.isFavorite) {
        setFavorites((prev) => prev.filter((r) => r._id !== recipeId));
        setSelectedRecipe(null);
        setMode("list");
      }
    } catch (error) {
      console.warn("Error alternando favorito desde favoritos", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => openDetail(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      {item.user?.username && (
        <Text style={styles.author}>por {item.user.username}</Text>
      )}
      {!!item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (mode === "detail" && selectedRecipe) {
    const isFavorite = favoriteIds.includes(selectedRecipe._id);
    return (
      <ScrollView
        style={styles.detailContainer}
        contentContainerStyle={styles.detailContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailHeroCard}>
          <View style={styles.detailImageWrapper}>
            <Image
              source={require("../assets/splash-icon.png")}
              style={styles.detailImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.detailTitleRow}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(selectedRecipe._id)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={isFavorite ? "favorite" : "favorite-border"}
                size={22}
                color={isFavorite ? "#ef4444" : "#f9fafb"}
              />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedRecipe.title}</Text>
            <View style={styles.detailTitleSpacer} />
          </View>
          {selectedRecipe.user?.username && (
            <Text style={styles.detailAuthor}>
              por {selectedRecipe.user.username}
            </Text>
          )}
          {!!selectedRecipe.description && (
            <Text style={styles.detailSubtitle}>{selectedRecipe.description}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Ingredientes</Text>
          {selectedRecipe.ingredientes && selectedRecipe.ingredientes.length ? (
            selectedRecipe.ingredientes.map((ing, index) => {
              const hasCantidades = Array.isArray(selectedRecipe.cantidades);
              const cantidad =
                hasCantidades && selectedRecipe.cantidades[index]
                  ? ` - ${selectedRecipe.cantidades[index]}`
                  : "";
              return (
                <Text
                  key={`${ing}-${index}`}
                  style={styles.detailItemText}
                >
                  {index + 1}. {ing}
                  {cantidad}
                </Text>
              );
            })
          ) : (
            <Text style={styles.detailEmptyText}>Sin ingredientes</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Pasos</Text>
          {selectedRecipe.pasos && selectedRecipe.pasos.length ? (
            selectedRecipe.pasos.map((step, index) => (
              <Text key={`${step}-${index}`} style={styles.detailItemText}>
                {index + 1}. { step }
              </Text>
            ))
          ) : (
            <Text style={styles.detailEmptyText}>Sin pasos</Text>
          )}
        </View>

        {!!selectedRecipe.comentarios && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Comentarios</Text>
            <Text style={styles.detailItemText}>{selectedRecipe.comentarios}</Text>
          </View>
        )}
      </ScrollView>
    );
  }

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
  detailContainer: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  detailContent: {
    paddingBottom: 120,
  },
  detailHeroCard: {
    backgroundColor: "#0d9488",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  detailImageWrapper: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  detailImage: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  detailTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 4,
    textAlign: "center",
    flex: 1,
  },
  detailTitleSpacer: {
    width: 32,
  },
  detailAuthor: {
    fontSize: 13,
    color: "#e5e7eb",
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: 4,
  },
  detailItemText: {
    fontSize: 13,
    color: "#e5e7eb",
    marginBottom: 2,
  },
  detailEmptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
