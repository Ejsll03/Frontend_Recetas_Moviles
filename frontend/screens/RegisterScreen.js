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

export default function RegisterScreen({ apiUrl, setLoading, goToLogin }) {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleRegister = async () => {
    try {
      if (!registerData.username || !registerData.email || !registerData.password) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
      }

      setLoading(true);
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error al registrarse", data.error || "Error desconocido");
        return;
      }

      Alert.alert("Éxito", "Cuenta creada, ahora inicia sesión");
      goToLogin(registerData.username);
    } catch (error) {
      console.error("Error en registro", error);
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
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>
          Empieza a guardar tus propias recetas
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          value={registerData.username}
          onChangeText={(text) =>
            setRegisterData({ ...registerData, username: text })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={registerData.email}
          onChangeText={(text) =>
            setRegisterData({ ...registerData, email: text })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={registerData.password}
          onChangeText={(text) =>
            setRegisterData({ ...registerData, password: text })
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>CREAR CUENTA</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    height: "40%",
  },
  formContainer: {
    flex: 1,
    marginTop: -24,
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
    backgroundColor: "#f97316",
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
