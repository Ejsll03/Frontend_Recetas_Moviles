import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

export default function ProfileScreen({
  apiUrl,
  setLoading,
  user,
  onUserUpdated,
  onLogout,
  onAccountDeleted,
  onGoToRecipes,
}) {
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      if (!profileData.username || !profileData.email) {
        Alert.alert("Error", "Usuario y correo son obligatorios");
        return;
      }

      setLoading(true);
      const body = {
        username: profileData.username,
        email: profileData.email,
      };
      if (profileData.password) {
        body.password = profileData.password;
      }

      const res = await fetch(`${apiUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo actualizar el perfil");
        return;
      }

      onUserUpdated(data.user);
      setProfileData({
        username: data.user.username,
        email: data.user.email,
        password: "",
      });
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando perfil", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción no se puede deshacer. ¿Seguro que quieres borrar tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await fetch(`${apiUrl}/auth/profile`, {
                method: "DELETE",
                credentials: "include",
              });

              const data = await res.json();

              if (!res.ok) {
                Alert.alert(
                  "Error",
                  data.error || "No se pudo eliminar la cuenta"
                );
                return;
              }

              Alert.alert("Cuenta eliminada", "Tu cuenta ha sido borrada");
              onAccountDeleted();
            } catch (error) {
              console.error("Error eliminando cuenta", error);
              Alert.alert("Error", "No se pudo conectar con el servidor");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Image
        source={require("../assets/splash-icon.png")}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Tu perfil</Text>
        {user && (
          <Text style={styles.subtitle}>@{user.username}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          value={profileData.username}
          onChangeText={(text) =>
            setProfileData({ ...profileData, username: text })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          keyboardType="email-address"
          value={profileData.email}
          onChangeText={(text) =>
            setProfileData({ ...profileData, email: text })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña (opcional)"
          placeholderTextColor="#6b7280"
          secureTextEntry
          value={profileData.password}
          onChangeText={(text) =>
            setProfileData({ ...profileData, password: text })
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Guardar cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recipesButton} onPress={onGoToRecipes}>
          <Text style={styles.recipesButtonText}>Mis recetas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  heroImage: {
    width: "100%",
    height: "35%",
  },
  formContainer: {
    flex: 1,
    marginTop: -24,
    marginHorizontal: 16,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    color: "#f9fafb",
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#4b5563",
    borderRadius: 999,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#020617",
    color: "#f9fafb",
  },
  button: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#020617",
    fontWeight: "600",
  },
  recipesButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  recipesButtonText: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#dc2626",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
