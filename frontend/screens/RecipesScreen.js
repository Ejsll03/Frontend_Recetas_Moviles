import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function RecipesScreen({ apiUrl, setLoading, onBack, onDetailOpen }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [selectedRecipeForGroup, setSelectedRecipeForGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredientes: [],
    newIngrediente: "",
    cantidades: [],
    newCantidad: "",
    pasos: [],
    newPaso: "",
    comentarios: "",
    publico: false,
  });
  const [mode, setMode] = useState("list");

  const loadGroups = async () => {
    try {
      setGroupLoading(true);
      const res = await fetch(`${apiUrl}/api/recipe-groups`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setGroups(data);
      } else {
        Alert.alert(
          "Error",
          data?.message || "No se pudieron cargar los grupos de recetas"
        );
      }
    } catch (error) {
      console.error("Error cargando grupos de recetas", error);
      Alert.alert("Error", "No se pudieron cargar los grupos de recetas");
    } finally {
      setGroupLoading(false);
    }
  };

  const openGroupModal = async (recipe) => {
    setSelectedRecipeForGroup(recipe);
    await loadGroups();
    setGroupModalVisible(true);
  };

  const handleAddToExistingGroup = async (groupId) => {
    if (!selectedRecipeForGroup) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${apiUrl}/api/recipe-groups/${groupId}/recipes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recipeId: selectedRecipeForGroup._id }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        Alert.alert(
          "Error",
          data?.message || "No se pudo añadir la receta al grupo"
        );
        return;
      }
      Alert.alert("Éxito", "Receta añadida al grupo");
      setGroupModalVisible(false);
    } catch (error) {
      console.error("Error añadiendo receta al grupo", error);
      Alert.alert(
        "Error",
        "No se pudo conectar con el servidor para añadir al grupo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroupAndAdd = async () => {
    if (!selectedRecipeForGroup) return;
    const trimmedName = newGroupName.trim();
    if (!trimmedName) {
      Alert.alert("Error", "El nombre del grupo es obligatorio");
      return;
    }
    try {
      setLoading(true);
      const createRes = await fetch(`${apiUrl}/api/recipe-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: trimmedName,
          description: newGroupDescription.trim(),
          publico: false,
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok || !created?._id) {
        Alert.alert(
          "Error",
          created?.message || "No se pudo crear el grupo"
        );
        return;
      }

      const addRes = await fetch(
        `${apiUrl}/api/recipe-groups/${created._id}/recipes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recipeId: selectedRecipeForGroup._id }),
        }
      );
      const addData = await addRes.json();
      if (!addRes.ok) {
        Alert.alert(
          "Error",
          addData?.message ||
            "Grupo creado, pero no se pudo añadir la receta"
        );
        return;
      }

      Alert.alert("Éxito", "Grupo creado y receta añadida");
      setNewGroupName("");
      setNewGroupDescription("");
      setGroupModalVisible(false);
    } catch (error) {
      console.error("Error creando grupo y añadiendo receta", error);
      Alert.alert(
        "Error",
        "No se pudo crear el grupo ni añadir la receta"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/recipes`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudieron cargar las recetas");
        return;
      }
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const ta = (a.title || "").toLowerCase();
            const tb = (b.title || "").toLowerCase();
            return ta.localeCompare(tb);
          })
        : [];
      setRecipes(sorted);
    } catch (error) {
      console.error("Error cargando recetas", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
    // Cargar favoritos del backend al iniciar
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

    loadFavorites();
  }, []);

  const openCreateForm = () => {
    setSelectedRecipe(null);
    setFormData({
      title: "",
      description: "",
      ingredientes: [],
      newIngrediente: "",
      cantidades: [],
      newCantidad: "",
      pasos: [],
      newPaso: "",
      comentarios: "",
      publico: false,
    });
    setMode("form");
  };

  const openEditForm = (recipe) => {
    setSelectedRecipe(recipe);
    setFormData({
      title: recipe.title || "",
      description: recipe.description || "",
      ingredientes: recipe.ingredientes || [],
      newIngrediente: "",
      cantidades: recipe.cantidades || [],
      newCantidad: "",
      pasos: recipe.pasos || [],
      newPaso: "",
      comentarios: recipe.comentarios || "",
      publico: !!recipe.publico,
    });
    setMode("form");
  };

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

  const addIngrediente = () => {
    const value = formData.newIngrediente.trim();
    if (!value) return;
    setFormData({
      ...formData,
      ingredientes: [...formData.ingredientes, value],
      newIngrediente: "",
    });
  };

  const removeIngrediente = (index) => {
    const copy = [...formData.ingredientes];
    copy.splice(index, 1);
    setFormData({ ...formData, ingredientes: copy });
  };

  const addCantidad = () => {
    const value = formData.newCantidad.trim();
    if (!value) return;
    setFormData({
      ...formData,
      cantidades: [...formData.cantidades, value],
      newCantidad: "",
    });
  };

  const removeCantidad = (index) => {
    const copy = [...formData.cantidades];
    copy.splice(index, 1);
    setFormData({ ...formData, cantidades: copy });
  };

  const addPaso = () => {
    const value = formData.newPaso.trim();
    if (!value) return;
    setFormData({
      ...formData,
      pasos: [...formData.pasos, value],
      newPaso: "",
    });
  };

  const removePaso = (index) => {
    const copy = [...formData.pasos];
    copy.splice(index, 1);
    setFormData({ ...formData, pasos: copy });
  };

  const handleSave = async () => {
    try {
      if (!formData.title) {
        Alert.alert("Error", "El título es obligatorio");
        return;
      }

      const body = {
        title: formData.title,
        description: formData.description,
        ingredientes: formData.ingredientes,
        cantidades: formData.cantidades,
        pasos: formData.pasos,
        comentarios: formData.comentarios,
        publico: formData.publico,
      };

      const isEdit = !!selectedRecipe;
      const url = isEdit
        ? `${apiUrl}/recipes/${selectedRecipe._id}`
        : `${apiUrl}/recipes`;
      const method = isEdit ? "PUT" : "POST";

      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo guardar la receta");
        return;
      }

      Alert.alert("Éxito", isEdit ? "Receta actualizada" : "Receta creada");
      setMode("list");
      setSelectedRecipe(null);
      await loadRecipes();
    } catch (error) {
      console.error("Error guardando receta", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (recipe) => {
    Alert.alert(
      "Eliminar receta",
      `¿Seguro que quieres eliminar la receta "${recipe.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await fetch(`${apiUrl}/recipes/${recipe._id}`, {
                method: "DELETE",
                credentials: "include",
              });
              const data = await res.json();
              if (!res.ok) {
                Alert.alert(
                  "Error",
                  data.error || "No se pudo eliminar la receta"
                );
                return;
              }
              await loadRecipes();
            } catch (error) {
              console.error("Error eliminando receta", error);
              Alert.alert("Error", "No se pudo conectar con el servidor");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (mode === "form") {
    const isEdit = !!selectedRecipe;
    return (
      <KeyboardAvoidingView
        style={styles.formScreen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.formScrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroWrapper}>
              <Image
                source={require("../assets/splash-icon.png")}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>
              {isEdit ? "Editar receta" : "Nueva receta"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={formData.title}
              onChangeText={(text) =>
                setFormData({ ...formData, title: text })
              }
              returnKeyType="done"
            />

            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />

            <Text style={styles.label}>Ingredientes</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Agregar ingrediente"
                value={formData.newIngrediente}
                onChangeText={(text) =>
                  setFormData({ ...formData, newIngrediente: text })
                }
                onSubmitEditing={addIngrediente}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.smallAddButton}
                onPress={addIngrediente}
              >
                <Text style={styles.smallButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {formData.ingredientes.map((ing, index) => (
              <View key={`${ing}-${index}`} style={styles.ingredientRow}>
                <Text style={styles.ingredientText}>{`${index + 1}. ${ing}`}</Text>
                <TouchableOpacity
                  style={styles.removeIngredientButton}
                  onPress={() => removeIngrediente(index)}
                >
                  <Text style={styles.removeIngredientText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.label}>Cantidades</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Agregar cantidad (mismo orden que ingredientes)"
                value={formData.newCantidad}
                onChangeText={(text) =>
                  setFormData({ ...formData, newCantidad: text })
                }
                onSubmitEditing={addCantidad}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.smallAddButton}
                onPress={addCantidad}
              >
                <Text style={styles.smallButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {formData.cantidades.map((cant, index) => (
              <View key={`${cant}-${index}`} style={styles.ingredientRow}>
                <Text style={styles.ingredientText}>{`${index + 1}. ${cant}`}</Text>
                <TouchableOpacity
                  style={styles.removeIngredientButton}
                  onPress={() => removeCantidad(index)}
                >
                  <Text style={styles.removeIngredientText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.label}>Pasos</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Agregar paso"
                value={formData.newPaso}
                onChangeText={(text) =>
                  setFormData({ ...formData, newPaso: text })
                }
                onSubmitEditing={addPaso}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.smallAddButton}
                onPress={addPaso}
              >
                <Text style={styles.smallButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {formData.pasos.map((paso, index) => (
              <View key={`${paso}-${index}`} style={styles.ingredientRow}>
                <Text style={styles.ingredientText}>{`${index + 1}. ${paso}`}</Text>
                <TouchableOpacity
                  style={styles.removeIngredientButton}
                  onPress={() => removePaso(index)}
                >
                  <Text style={styles.removeIngredientText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Comentarios"
              multiline
              scrollEnabled={false}
              value={formData.comentarios}
              onChangeText={(text) =>
                setFormData({ ...formData, comentarios: text })
              }
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Pública</Text>
              <Switch
                value={formData.publico}
                onValueChange={(val) =>
                  setFormData({ ...formData, publico: val })
                }
              />
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setMode("list")}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.formPrimaryButton}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>
                  {isEdit ? "Guardar" : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

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
          {!!selectedRecipe.description && (
            <Text style={styles.detailSubtitle}>{selectedRecipe.description}</Text>
          )}
          {Array.isArray(selectedRecipe.groups) && selectedRecipe.groups.length > 0 && (
            <Text style={styles.detailGroupsLabel}>
              Pertenece a: {selectedRecipe.groups.map((g) => g.name).join(', ')}
            </Text>
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
      <Text style={styles.title}>Mis recetas</Text>

      <TouchableOpacity style={styles.button} onPress={openCreateForm}>
        <Text style={styles.buttonText}>Añadir receta</Text>
      </TouchableOpacity>

      <FlatList
        style={styles.list}
        data={recipes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => openDetail(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!!item.description && (
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <Text style={styles.badge}>
                {item.publico ? "Pública" : "Privada"}
              </Text>
              {Array.isArray(item.groups) && item.groups.length > 0 && (
                <Text style={styles.groupsLabel} numberOfLines={1}>
                  Grupos: {item.groups.map((g) => g.name).join(', ')}
                </Text>
              )}
            </View>
            <View style={styles.cardButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openGroupModal(item)}
              >
                <MaterialIcons name="folder-special" size={20} color="#f9fafb" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openEditForm(item)}
              >
                <MaterialIcons name="edit" size={20} color="#f9fafb" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButtonDelete}
                onPress={() => handleDelete(item)}
              >
                <MaterialIcons name="delete" size={20} color="#f9fafb" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aún no tienes recetas. Pulsa "Añadir receta" para crear una.
          </Text>
        }
      />

      <Modal
        visible={groupModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGroupModalVisible(false)}
      >
        <View style={styles.groupModalOverlay}>
          <View style={styles.groupModalContent}>
            <Text style={styles.groupModalTitle}>
              Añadir "{selectedRecipeForGroup?.title}" a un grupo
            </Text>
            {groupLoading ? (
              <View style={styles.groupModalLoadingRow}>
                <ActivityIndicator color="#f97316" />
                <Text style={styles.groupModalLoadingText}>
                  Cargando grupos...
                </Text>
              </View>
            ) : groups.length > 0 ? (
              <FlatList
                data={groups}
                keyExtractor={(g) => g._id}
                renderItem={({ item: g }) => (
                  <TouchableOpacity
                    style={styles.groupItem}
                    onPress={() => handleAddToExistingGroup(g._id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.groupItemName}>{g.name}</Text>
                      {!!g.description && (
                        <Text
                          style={styles.groupItemDescription}
                          numberOfLines={2}
                        >
                          {g.description}
                        </Text>
                      )}
                    </View>
                    <MaterialIcons
                      name="playlist-add"
                      size={22}
                      color="#f9fafb"
                    />
                  </TouchableOpacity>
                )}
                style={styles.groupList}
              />
            ) : (
              <Text style={styles.groupEmptyText}>
                No tienes grupos aún. Crea uno nuevo abajo.
              </Text>
            )}

            <View style={styles.groupModalDivider} />
            <Text style={styles.groupModalSubtitle}>Crear nuevo grupo</Text>
            <TextInput
              style={styles.groupInput}
              placeholder="Nombre del grupo"
              placeholderTextColor="#6b7280"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TextInput
              style={[styles.groupInput, styles.groupInputMultiline]}
              placeholder="Descripción (opcional)"
              placeholderTextColor="#6b7280"
              value={newGroupDescription}
              onChangeText={setNewGroupDescription}
              multiline
            />
            <View style={styles.groupModalButtonsRow}>
              <TouchableOpacity
                style={[styles.groupButton, styles.groupButtonSecondary]}
                onPress={() => setGroupModalVisible(false)}
              >
                <Text style={styles.groupButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.groupButton, styles.groupButtonPrimary]}
                onPress={handleCreateGroupAndAdd}
              >
                <Text style={styles.groupButtonPrimaryText}>
                  Crear grupo y añadir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    paddingVertical: 24,
  },
  heroWrapper: {
    width: "100%",
    height: 180,
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#f9fafb",
  },
  groupsLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
  },
  detailGroupsLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#e5e7eb",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fa8c3e",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  groupModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  groupModalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  groupModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 12,
  },
  groupModalLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  groupModalLoadingText: {
    marginLeft: 8,
    color: "#e5e7eb",
  },
  groupList: {
    marginBottom: 12,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b1120",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  groupItemName: {
    color: "#f9fafb",
    fontWeight: "600",
  },
  groupItemDescription: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  groupEmptyText: {
    color: "#9ca3af",
    marginBottom: 12,
    textAlign: "center",
  },
  groupModalDivider: {
    height: 1,
    backgroundColor: "#111827",
    marginVertical: 8,
  },
  groupModalSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  groupInput: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#f9fafb",
    marginBottom: 8,
  },
  groupInputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  groupModalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  groupButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginLeft: 8,
  },
  groupButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  groupButtonSecondaryText: {
    color: "#e5e7eb",
    fontWeight: "500",
  },
  groupButtonPrimary: {
    backgroundColor: "#f97316",
  },
  groupButtonPrimaryText: {
    color: "#111827",
    fontWeight: "600",
  },
  formPrimaryButton: {
    backgroundColor: "#fa8c3e",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  secondaryButton: {
    marginTop: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4b5563",
    flex: 1,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: "#e5e7eb",
  },
  list: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 4,
  },
  badge: {
    marginTop: 6,
    fontSize: 12,
    color: "#2563eb",
  },
  cardButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  iconButtonDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  formScreen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  formScrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 280,
  },
  label: {
    fontSize: 12,
    color: "#e5e7eb",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
    color: "#6b7280",
  },
  smallAddButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fa8c3e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
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
    backgroundColor: "#fa8c3e",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
    marginBottom: 4,
  },
  ingredientText: {
    flex: 1,
    marginRight: 8,
    color: "#111827",
  },
  removeIngredientButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#dc2626",
  },
  removeIngredientText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
