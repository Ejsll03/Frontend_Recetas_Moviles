import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
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
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Guardar" onPress={handleSave} />
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
    backgroundColor: "#1e40af",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  createButtonText: {
    color: "#f9fafb",
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
    backgroundColor: "#1f2937",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
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
    color: "#3b82f6",
    marginLeft: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#1f2937",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#374151",
    color: "#f9fafb",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default RecipeGroupsScreen;

