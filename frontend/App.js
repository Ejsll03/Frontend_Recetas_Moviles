import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RecipesScreen from "./screens/RecipesScreen";

const API_URL = "http://192.168.0.138:5000"; // Cambia a la URL de tu backend si usas dispositivo físico

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login"); // login | register | profile | recipes
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

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
          const profileRes = await fetch(`${API_URL}/auth/profile`, {
            method: "GET",
            credentials: "include",
          });
          const profileDataJson = await profileRes.json();

          if (profileRes.ok) {
            setUser(profileDataJson.user);
            setCurrentScreen("recipes");
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
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Header simple con botón de perfil cuando el usuario está autenticado */}
      {user && currentScreen !== "login" && currentScreen !== "register" && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen("profile")} style={styles.profileButton}>
            <MaterialIcons name="person-outline" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={22} color="#e5e7eb" />
          </TouchableOpacity>
        </View>
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}

      {currentScreen === "login" && (
        <LoginScreen
          apiUrl={API_URL}
          setLoading={setLoading}
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            setCurrentScreen("recipes");
          }}
          goToRegister={() => setCurrentScreen("register")} 
        />
      )}
      {currentScreen === "register" && (
        <RegisterScreen
          apiUrl={API_URL}
          setLoading={setLoading}
          goToLogin={(usernameFromRegister) => {
            setCurrentScreen("login");
          }}
        />
      )}
      {currentScreen === "profile" && (
        <ProfileScreen
          apiUrl={API_URL}
          setLoading={setLoading}
          user={user}
          onUserUpdated={(updatedUser) => setUser(updatedUser)}
          onLogout={handleLogout}
          onAccountDeleted={() => {
            setUser(null);
            setCurrentScreen("login");
          }}
          onGoToRecipes={() => setCurrentScreen("recipes")}
        />
      )}
      {currentScreen === "recipes" && (
        <RecipesScreen
          apiUrl={API_URL}
          setLoading={setLoading}
          onBack={() => setCurrentScreen("profile")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "flex-start",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#020617",
  },
  headerButtonText: {
    color: "#e5e7eb",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  profileButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
});
