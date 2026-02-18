import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

export default function LoginScreen({
  apiUrl,
  setLoading,
  onLoginSuccess,
  goToRegister,
}) {
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  const handleLogin = async () => {
    try {
      if (!loginData.username || !loginData.password) {
        Alert.alert("Error", "Debes ingresar usuario y contraseña");
        return;
      }

      setLoading(true);
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          "Error al iniciar sesión",
          data.error || "Error desconocido"
        );
        return;
      }

      onLoginSuccess(data.user);
    } catch (error) {
      console.error("Error en login", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Image
        source={require("../assets/splash-icon.png")}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>
          Tus recetas favoritas en un solo lugar
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          value={loginData.username}
          onChangeText={(text) =>
            setLoginData({ ...loginData, username: text })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={loginData.password}
          onChangeText={(text) =>
            setLoginData({ ...loginData, password: text })
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToRegister}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
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
    height: "45%",
  },
  formContainer: {
    flex: 1,
    marginTop: -32,
    marginHorizontal: 16,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#020617",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#f9fafb",
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
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
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#020617",
    fontWeight: "600",
  },
  linkText: {
    marginTop: 16,
    textAlign: "center",
    color: "#9ca3af",
  },
});
