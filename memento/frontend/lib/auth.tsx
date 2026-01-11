// lib/auth.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8080/api";

interface PrimaryCaregiver {
  name: string;
  relationship: string;
  contact: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  timezone?: string;
  primaryCaregiver?: PrimaryCaregiver;
}

interface SignupData {
  name: string;
  profileImage?: string;
  timezone: string;
  primaryCaregiver: PrimaryCaregiver;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    userData: SignupData
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfileImage: (imageBase64: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          Cookies.remove("token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        Cookies.remove("token");
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    Cookies.set("token", data.token, {
      expires: 7,
      path: "/",
      sameSite: "strict",
    });
    setUser(data.user);

    window.location.replace("/dashboard");
  };

  const signup = async (
    email: string,
    password: string,
    userData: SignupData
  ) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: userData.name,
        profileImage: userData.profileImage,
        timezone: userData.timezone,
        primaryCaregiver: userData.primaryCaregiver,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Signup failed");
    }

    const data = await response.json();
    Cookies.set("token", data.token, {
      expires: 7,
      path: "/",
      sameSite: "strict",
    });
    setUser(data.user);

    window.location.replace("/dashboard");
  };

  const updateProfileImage = async (imageBase64: string) => {
    const token = Cookies.get("token");
    const response = await fetch(`${API_URL}/user/update-profile-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile image");
    }

    const data = await response.json();
    setUser(data);
  };

  const logout = () => {
    Cookies.remove("token", { path: "/" });
    setUser(null);
    window.location.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isLoading, updateProfileImage }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
