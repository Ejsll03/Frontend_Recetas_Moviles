import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import axios from "axios";
import { API_URL } from "../config";

const AddRecipeToGroupScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/recipes`, {
        withCredentials: true,
      });
      const groupResponse = await axios.get(
        `${API_URL}/api/recipe-groups/${groupId}`,
        { withCredentials: true }
      );
      const recipesInGroup = groupResponse.data.recipes.map(r => r._id);
      const availableRecipes = response.data.filter(r => !recipesInGroup.includes(r._id));
      setRecipes(availableRecipes);
    } catch (error) {
      console.error("Error fetching user recipes:", error);
      Alert.alert("Error", "No se pudieron cargar tus recetas.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchUserRecipes();
  }, [fetchUserRecipes]);

  const handleAddRecipe = async (recipeId) => {
    try {
      await axios.post(
        `${API_URL}/api/recipe-groups/${groupId}/recipes`,
        { recipeId },
        { withCredentials: true }
      );
      Alert.alert("Éxito", "Receta añadida al grupo.", [
        {
          text: "OK",
          onPress: () => {
            fetchUserRecipes();
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding recipe to group:", error);
      Alert.alert("Error", "No se pudo añadir la receta al grupo.");
    }
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.recipeContainer}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <TouchableOpacity onPress={() => handleAddRecipe(item._id)}>
        <Text style={styles.addText}>Añadir</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando recetas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Añadir Receta al Grupo</Text>
      {recipes.length > 0 ? (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item._id.toString()}
        />
      ) : (
        <Text style={styles.emptyText}>
          No tienes más recetas para añadir a este grupo.
        </Text>
      )}
      <Button title="Volver al Grupo" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 20,
  },
  recipeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1f2937",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 18,
    color: "#f9fafb",
  },
  addText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  loadingText: {
    color: "#e5e7eb",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    color: "#e5e7eb",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default AddRecipeToGroupScreen;
