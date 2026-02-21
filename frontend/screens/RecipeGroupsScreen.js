import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";

const RecipeGroupsScreen = ({ apiUrl }) => {
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupRecipes, setGroupRecipes] = useState([]);
  const [availableRecipes, setAvailableRecipes] = useState([]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/recipe-groups`, {
        withCredentials: true,
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching recipe groups:", error);
      Alert.alert("Error", "No se pudieron cargar los grupos de recetas.");
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openManageRecipes = async (group) => {
    try {
      setSelectedGroup(group);
      const response = await axios.get(`${apiUrl}/recipes`, {
        withCredentials: true,
      });
      const groupRecipeIds = (group.recipes || []).map((r) => r._id);
      const available = response.data.filter(
        (r) => !groupRecipeIds.includes(r._id)
      );
      setGroupRecipes(group.recipes || []);
      setAvailableRecipes(available);
      setManageModalVisible(true);
    } catch (error) {
      console.error("Error fetching recipes for group:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar las recetas para este grupo."
      );
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentGroup(null);
    setName("");
    setDescription("");
    setModalVisible(true);
  };

  const handleEdit = (group) => {
    setIsEditing(true);
    setCurrentGroup(group);
    setName(group.name);
    setDescription(group.description);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert("Confirmar", "¿Estás seguro de que quieres eliminar este grupo?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await axios.delete(`${apiUrl}/api/recipe-groups/${id}`, {
              withCredentials: true,
            });
            fetchGroups();
          } catch (error) {
            console.error("Error deleting recipe group:", error);
            Alert.alert("Error", "No se pudo eliminar el grupo.");
          }
        },
      },
    ]);
  };

  const handleRemoveRecipeFromGroup = (recipeId) => {
    if (!selectedGroup) return;

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
                `${apiUrl}/api/recipe-groups/${selectedGroup._id}/recipes/${recipeId}`,
                { withCredentials: true }
              );

              const removedRecipe = groupRecipes.find(
                (r) => r._id === recipeId
              );

              setGroupRecipes((prev) =>
                prev.filter((r) => r._id !== recipeId)
              );

              if (removedRecipe) {
                setAvailableRecipes((prev) => {
                  if (prev.some((p) => p._id === removedRecipe._id)) {
                    return prev;
                  }
                  return [...prev, removedRecipe];
                });
              }

              setGroups((prev) =>
                prev.map((g) =>
                  g._id === selectedGroup._id
                    ? {
                        ...g,
                        recipes: (g.recipes || []).filter(
                          (r) => r._id !== recipeId
                        ),
                      }
                    : g
                )
              );
            } catch (error) {
              console.error("Error removing recipe from group:", error);
              Alert.alert(
                "Error",
                "No se pudo quitar la receta del grupo."
              );
            }
          },
        },
      ]
    );
  };

  const handleAddRecipeToGroup = async (recipeId) => {
    if (!selectedGroup) return;

    try {
      await axios.post(
        `${apiUrl}/api/recipe-groups/${selectedGroup._id}/recipes`,
        { recipeId },
        { withCredentials: true }
      );

      const addedRecipe = availableRecipes.find((r) => r._id === recipeId);

      if (addedRecipe) {
        setGroupRecipes((prev) => [...prev, addedRecipe]);
        setAvailableRecipes((prev) =>
          prev.filter((r) => r._id !== recipeId)
        );
        setGroups((prev) =>
          prev.map((g) =>
            g._id === selectedGroup._id
              ? {
                  ...g,
                  recipes: [
                    ...(g.recipes || []),
                    {
                      _id: addedRecipe._id,
                      title: addedRecipe.title,
                    },
                  ],
                }
              : g
          )
        );
      } else {
        fetchGroups();
      }
    } catch (error) {
      console.error("Error adding recipe to group:", error);
      Alert.alert("Error", "No se pudo añadir la receta al grupo.");
    }
  };

  const handleSave = async () => {
    const groupData = { name, description };
    try {
      if (isEditing) {
        await axios.put(
          `${apiUrl}/api/recipe-groups/${currentGroup._id}`,
          groupData,
          { withCredentials: true }
        );
      } else {
        await axios.post(`${apiUrl}/api/recipe-groups`, groupData, {
          withCredentials: true,
        });
      }
      fetchGroups();
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving recipe group:", error);
      Alert.alert("Error", "No se pudo guardar el grupo.");
    }
  };

  const renderGroup = ({ item }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
      {item.recipes && item.recipes.length > 0 && (
        <View style={styles.groupRecipesOverview}>
          <Text style={styles.groupRecipesTitle}>Recetas en este grupo</Text>
          {item.recipes.slice(0, 3).map((r) => (
            <Text key={r._id} style={styles.groupRecipeItem}>
              • {r.title}
            </Text>
          ))}
          {item.recipes.length > 3 && (
            <Text style={styles.groupRecipesMore}>
              y {item.recipes.length - 3} más...
            </Text>
          )}
        </View>
      )}
      <View style={styles.groupActions}>
        <TouchableOpacity onPress={() => openManageRecipes(item)}>
          <Text style={styles.actionText}>Recetas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grupos de Recetas</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Crear Nuevo Grupo</Text>
      </TouchableOpacity>
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes grupos de recetas.</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item._id}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {isEditing ? "Editar Grupo" : "Crear Grupo"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del grupo"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonPrimaryText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={manageModalVisible}
        onRequestClose={() => setManageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {selectedGroup
                ? `Recetas de ${selectedGroup.name}`
                : "Recetas del grupo"}
            </Text>
            <View style={styles.recipesSection}>
              <Text style={styles.sectionTitle}>En este grupo</Text>
              {groupRecipes.length > 0 ? (
                groupRecipes.map((r) => (
                  <View key={r._id} style={styles.recipeRow}>
                    <Text style={styles.recipeTitle}>{r.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveRecipeFromGroup(r._id)}
                    >
                      <Text style={styles.removeText}>Quitar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyTextSmall}>
                  No hay recetas en este grupo.
                </Text>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                Otras recetas para añadir
              </Text>
              {availableRecipes.length > 0 ? (
                availableRecipes.map((r) => (
                  <View key={r._id} style={styles.recipeRow}>
                    <Text style={styles.recipeTitle}>{r.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleAddRecipeToGroup(r._id)}
                    >
                      <Text style={styles.addText}>Añadir</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyTextSmall}>
                  No tienes más recetas para añadir.
                </Text>
              )}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { alignSelf: "center" }]}
                onPress={() => setManageModalVisible(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: "#fa8c3e",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  createButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#e5e7eb",
    fontSize: 16,
  },
  groupContainer: {
    backgroundColor: "#0b1120",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb",
  },
  groupDescription: {
    color: "#d1d5db",
    marginTop: 4,
  },
  groupRecipesOverview: {
    marginTop: 8,
  },
  groupRecipesTitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  groupRecipeItem: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  groupRecipesMore: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  groupActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  actionText: {
    color: "#f97316",
    marginLeft: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.8)",
  },
  modalContent: {
    backgroundColor: "#020617",
    padding: 20,
    borderRadius: 16,
    width: "80%",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#020617",
    color: "#f9fafb",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  recipesSection: {
    maxHeight: 320,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 6,
    fontWeight: "600",
  },
  recipeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 15,
    color: "#f9fafb",
    marginRight: 8,
  },
  removeText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  addText: {
    color: "#f97316",
    fontWeight: "600",
  },
  emptyTextSmall: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 4,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginLeft: 8,
  },
  modalButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  modalButtonSecondaryText: {
    color: "#e5e7eb",
    fontWeight: "500",
  },
  modalButtonPrimary: {
    backgroundColor: "#f97316",
  },
  modalButtonPrimaryText: {
    color: "#111827",
    fontWeight: "600",
  },
});

export default RecipeGroupsScreen;

