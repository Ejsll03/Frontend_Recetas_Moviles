import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://192.168.0.138:5000"; // Cambia a la URL de tu backend si usas dispositivo físico

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login"); // login | register | profile
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Al iniciar la app, verificar si ya hay sesión activa
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/auth/check`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (data.isAuthenticated) {
          // Obtener perfil completo
          const profileRes = await fetch(`${API_URL}/auth/profile`, {
            method: "GET",
            credentials: "include",
          });
          const profileDataJson = await profileRes.json();

          if (profileRes.ok) {
            setUser(profileDataJson.user);
            setProfileData({
              username: profileDataJson.user.username,
              email: profileDataJson.user.email,
              password: "",
            });
            setCurrentScreen("profile");
          }
        }
      } catch (error) {
        console.warn("Error comprobando sesión", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    try {
      if (!loginData.username || !loginData.password) {
        Alert.alert("Error", "Debes ingresar usuario y contraseña");
        return;
      }

      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error al iniciar sesión", data.error || "Error desconocido");
        return;
      }

      // Después de login, obtener perfil completo
      const profileRes = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        credentials: "include",
      });
      const profileDataJson = await profileRes.json();

      if (profileRes.ok) {
        setUser(profileDataJson.user);
        setProfileData({
          username: profileDataJson.user.username,
          email: profileDataJson.user.email,
          password: "",
        });
        setCurrentScreen("profile");
      } else {
        Alert.alert("Error", profileDataJson.error || "No se pudo cargar el perfil");
      }
    } catch (error) {
      console.error("Error en login", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!registerData.username || !registerData.email || !registerData.password) {
        Alert.alert("Error", "Completa todos los campos");
        return;
      }

      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error al registrarse", data.error || "Error desconocido");
        return;
      }

      Alert.alert("Éxito", "Usuario registrado, ahora puedes iniciar sesión");
      setCurrentScreen("login");
      setLoginData({ username: registerData.username, password: "" });
    } catch (error) {
      console.error("Error en registro", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

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

      const res = await fetch(`${API_URL}/auth/profile`, {
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

      setUser(data.user);
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
              const res = await fetch(`${API_URL}/auth/profile`, {
                method: "DELETE",
                credentials: "include",
              });

              const data = await res.json();

              if (!res.ok) {
                Alert.alert("Error", data.error || "No se pudo eliminar la cuenta");
                return;
              }

              Alert.alert("Cuenta eliminada", "Tu cuenta ha sido borrada");
              setUser(null);
              setCurrentScreen("login");
              setLoginData({ username: "", password: "" });
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

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      setUser(null);
      setCurrentScreen("login");
      setLoginData({ username: "", password: "" });
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        autoCapitalize="none"
        value={loginData.username}
        onChangeText={(text) => setLoginData({ ...loginData, username: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={loginData.password}
        onChangeText={(text) => setLoginData({ ...loginData, password: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCurrentScreen("register")}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegister = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        autoCapitalize="none"
        value={registerData.username}
        onChangeText={(text) =>
          setRegisterData({ ...registerData, username: text })
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={registerData.email}
        onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={registerData.password}
        onChangeText={(text) =>
          setRegisterData({ ...registerData, password: text })
        }
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCurrentScreen("login")}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Perfil</Text>
      {user && (
        <Text style={styles.subtitle}>ID: {user._id || user.id}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        autoCapitalize="none"
        value={profileData.username}
        onChangeText={(text) =>
          setProfileData({ ...profileData, username: text })
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={profileData.email}
        onChangeText={(text) => setProfileData({ ...profileData, email: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña (opcional)"
        secureTextEntry
        value={profileData.password}
        onChangeText={(text) =>
          setProfileData({ ...profileData, password: text })
        }
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
        <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}

      {currentScreen === "login" && renderLogin()}
      {currentScreen === "register" && renderRegister()}
      {currentScreen === "profile" && renderProfile()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
  },
  formContainer: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
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
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  linkText: {
    marginTop: 12,
    textAlign: "center",
    color: "#2563eb",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  secondaryButtonText: {
    color: "#111827",
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#dc2626",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
