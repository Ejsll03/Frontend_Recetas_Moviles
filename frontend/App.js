import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RecipesScreen from "./screens/RecipesScreen";
import PublicRecipesScreen from "./screens/PublicRecipesScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import RecipeGroupsScreen from "./screens/RecipeGroupsScreen";

const API_URL = "http://192.168.0.138:5000"; // Cambia a la URL de tu backend si usas dispositivo físico

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login"); // login | register | profile | recipes | favorites | public | groups
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("recipes"); // recipes | favorites | public | groups | profile
  const [recipesViewVersion, setRecipesViewVersion] = useState(0);
  const [publicViewVersion, setPublicViewVersion] = useState(0);
  const [recipesDetailOpen, setRecipesDetailOpen] = useState(false);
  const [publicDetailOpen, setPublicDetailOpen] = useState(false);

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
            setCurrentTab("recipes");
            setRecipesDetailOpen(false);
            setPublicDetailOpen(false);
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
      setRecipesDetailOpen(false);
      setPublicDetailOpen(false);
      setLoading(false);
    }
  };

  const handleHeaderBack = () => {
    if (currentScreen === "recipes") {
      setRecipesViewVersion((v) => v + 1);
      setRecipesDetailOpen(false);
    } else if (currentScreen === "public") {
      setPublicViewVersion((v) => v + 1);
      setPublicDetailOpen(false);
    }
  };

  const showBackButton =
    (currentScreen === "recipes" && recipesDetailOpen) ||
    (currentScreen === "public" && publicDetailOpen);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Header superior con botón de volver (si aplica) y logout cuando hay sesión */}
      {user && currentScreen !== "login" && currentScreen !== "register" && (
        <View style={styles.header}>
          <View style={styles.headerSide}>
            {showBackButton && (
              <TouchableOpacity
                onPress={handleHeaderBack}
                style={styles.logoutButton}
              >
                <MaterialIcons name="arrow-back" size={22} color="#e5e7eb" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerSideRight}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <MaterialIcons name="logout" size={22} color="#e5e7eb" />
            </TouchableOpacity>
          </View>
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
            setCurrentTab("recipes");
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
          onGoToRecipes={() => {
            setCurrentScreen("recipes");
            setCurrentTab("recipes");
          }}
        />
      )}
      {currentScreen === "favorites" && (
        <FavoritesScreen apiUrl={API_URL} setLoading={setLoading} />
      )}
      {currentScreen === "public" && (
        <PublicRecipesScreen
          key={publicViewVersion}
          apiUrl={API_URL}
          setLoading={setLoading}
          onDetailOpen={() => setPublicDetailOpen(true)}
        />
      )}
      {currentScreen === "groups" && (
        <RecipeGroupsScreen />
      )}
      {currentScreen === "recipes" && (
        <RecipesScreen
          key={recipesViewVersion}
          apiUrl={API_URL}
          setLoading={setLoading}
          onBack={() => setCurrentScreen("profile")}
          onDetailOpen={() => setRecipesDetailOpen(true)}
        />
      )}
      {user && currentScreen !== "login" && currentScreen !== "register" && (
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabItem,
                currentTab === "favorites" && styles.tabItemActive,
              ]}
              onPress={() => {
                setCurrentScreen("favorites");
                setCurrentTab("favorites");
              }}
            >
              <MaterialIcons
                name="favorite-border"
                size={22}
                color={
                  currentTab === "favorites" ? "#f97316" : "#6b7280"
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  currentTab === "favorites" && styles.tabLabelActive,
                ]}
              >
                Favoritos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                currentTab === "recipes" && styles.tabItemActive,
              ]}
              onPress={() => {
                setCurrentScreen("recipes");
                setCurrentTab("recipes");
              }}
            >
              <MaterialIcons
                name="restaurant-menu"
                size={22}
                color={currentTab === "recipes" ? "#f97316" : "#6b7280"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  currentTab === "recipes" && styles.tabLabelActive,
                ]}
              >
                Mis recetas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                currentTab === "public" && styles.tabItemActive,
              ]}
              onPress={() => {
                setCurrentScreen("public");
                setCurrentTab("public");
              }}
            >
              <MaterialIcons
                name="public"
                size={22}
                color={currentTab === "public" ? "#f97316" : "#6b7280"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  currentTab === "public" && styles.tabLabelActive,
                ]}
              >
                Públicas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                currentTab === "groups" && styles.tabItemActive,
              ]}
              onPress={() => {
                setCurrentScreen("groups");
                setCurrentTab("groups");
              }}
            >
              <MaterialIcons
                name="folder-special"
                size={22}
                color={currentTab === "groups" ? "#f97316" : "#6b7280"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  currentTab === "groups" && styles.tabLabelActive,
                ]}
              >
                Grupos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                currentTab === "profile" && styles.tabItemActive,
              ]}
              onPress={() => {
                setCurrentScreen("profile");
                setCurrentTab("profile");
              }}
            >
              <MaterialIcons
                name="person-outline"
                size={22}
                color={currentTab === "profile" ? "#f97316" : "#6b7280"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  currentTab === "profile" && styles.tabLabelActive,
                ]}
              >
                Perfil
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  headerSide: {
    minWidth: 36,
    alignItems: "flex-start",
  },
  headerSideRight: {
    minWidth: 36,
    alignItems: "flex-end",
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
  tabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabItemActive: {},
  tabLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#6b7280",
  },
  tabLabelActive: {
    color: "#f97316",
    fontWeight: "600",
  },
  profileButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
  },
});
