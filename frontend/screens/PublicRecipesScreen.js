import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function PublicRecipesScreen({ apiUrl, setLoading, onDetailOpen }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [mode, setMode] = useState("list"); // list | detail
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    const loadPublicRecipes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/recipes/public`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setRecipes(data);
        }
      } catch (error) {
        console.error("Error cargando recetas públicas", error);
      } finally {
        setLoading(false);
      }
    };

    const loadFavorites = async () => {
      try {
        const res = await fetch(`${apiUrl}/recipes/favorites`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setFavoriteIds(data.map((r) => r._id));
        }
      } catch (error) {
        console.warn("Error cargando favoritos", error);
      }
    };

    loadPublicRecipes();
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
    } catch (error) {
      console.warn("Error alternando favorito", error);
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
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
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
            <Text style={styles.detailAuthor}>por {selectedRecipe.user.username}</Text>
          )}
          {!!selectedRecipe.description && (
            <Text style={styles.detailSubtitle}>{selectedRecipe.description}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Ingredientes</Text>
          {selectedRecipe.ingredientes && selectedRecipe.ingredientes.length ? (
            selectedRecipe.ingredientes.map((ing, index) => (
              <Text key={`${ing}-${index}`} style={styles.detailItemText}>
                {index + 1}. {ing}
              </Text>
            ))
          ) : (
            <Text style={styles.detailEmptyText}>Sin ingredientes</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Pasos</Text>
          {selectedRecipe.pasos && selectedRecipe.pasos.length ? (
            selectedRecipe.pasos.map((step, index) => (
              <Text key={`${step}-${index}`} style={styles.detailItemText}>
                {index + 1}. {step}
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
      <Text style={styles.header}>Recetas públicas</Text>
      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay recetas públicas disponibles.</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
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
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  detailContent: {
    paddingBottom: 32,
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
  detailFooter: {
    marginTop: 16,
  },
  detailPrimaryButton: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  detailPrimaryButtonText: {
    color: "#020617",
    fontWeight: "600",
  },
});
