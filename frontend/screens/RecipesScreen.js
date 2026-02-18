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
} from "react-native";

export default function RecipesScreen({ apiUrl, setLoading, onBack }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // null = creando
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
  const [mode, setMode] = useState("list"); // list | form

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
      setRecipes(data);
    } catch (error) {
      console.error("Error cargando recetas", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formContent}
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
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
          <View style={styles.card}>
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
            </View>
            <View style={styles.cardButtons}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => openEditForm(item)}
              >
                <Text style={styles.smallButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, styles.smallDeleteButton]}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.smallButtonText}>Borrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aún no tienes recetas. Pulsa "Añadir receta" para crear una.
          </Text>
        }
      />

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
  button: {
    backgroundColor: "#f97316",
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
  formPrimaryButton: {
    backgroundColor: "#f97316",
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
    justifyContent: "space-between",
    marginLeft: 8,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#020617",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  smallDeleteButton: {
    backgroundColor: "#dc2626",
  },
  smallButtonText: {
    color: "#ffffff",
    fontSize: 12,
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
  formContent: {
    paddingBottom: 140,
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
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
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
