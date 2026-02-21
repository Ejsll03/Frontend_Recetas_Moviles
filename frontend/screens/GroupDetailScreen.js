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
import { useNavigation } from "@react-navigation/native";

const GroupDetailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/recipe-groups/${groupId}`,
        { withCredentials: true }
      );
      setGroup(response.data);
    } catch (error) {
      console.error("Error fetching group details:", error);
      Alert.alert("Error", "No se pudieron cargar los detalles del grupo.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroupDetails();
    });
    return unsubscribe;
  }, [navigation, fetchGroupDetails]);

  const handleRemoveRecipe = async (recipeId) => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres quitar esta receta del grupo?",
      [
        { text: "Cancelar" },
        {
          text: "Quitar",
          onPress: async () => {
            try {
              await axios.delete(
                `${API_URL}/api/recipe-groups/${groupId}/recipes/${recipeId}`,
                { withCredentials: true }
              );
              fetchGroupDetails();
            } catch (error) {
              console.error("Error removing recipe from group:", error);
              Alert.alert("Error", "No se pudo quitar la receta del grupo.");
            }
          },
        },
      ]
    );
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.recipeContainer}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <TouchableOpacity onPress={() => handleRemoveRecipe(item._id)}>
        <Text style={styles.removeText}>Quitar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No se encontró el grupo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{group.name}</Text>
      <Text style={styles.description}>{group.description}</Text>
      <Button
        title="Añadir Receta al Grupo"
        onPress={() => navigation.navigate("AddRecipeToGroup", { groupId })}
      />
      {group.recipes && group.recipes.length > 0 ? (
        <FlatList
          data={group.recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item._id.toString()}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>Este grupo no tiene recetas.</Text>
      )}
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#d1d5db",
    marginBottom: 20,
  },
  list: {
    marginTop: 20,
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
  removeText: {
    color: "#ef4444",
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

export default GroupDetailScreen;
