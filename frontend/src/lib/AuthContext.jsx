import React, { createContext, useContext, useEffect, useState } from "react";

import {
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  login as loginRequest,
  setStoredToken,
  signup as signupRequest,
} from "@/lib/auth-client";

const AuthContext = createContext(null);

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    void restoreSession();
  }, []);

  const restoreSession = async () => {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      setAuthError(null);
      setIsLoadingAuth(false);
      return null;
    }

    setIsLoadingAuth(true);

    try {
      const session = await fetchCurrentUser(token);
      setUser(session.user);
      setAuthError(null);
      return session.user;
    } catch (error) {
      clearStoredToken();
      setUser(null);
      setAuthError(getErrorMessage(error));
      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (credentials) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const session = await loginRequest(credentials);
      setStoredToken(session.token);
      setUser(session.user);
      return session.user;
    } catch (error) {
      setUser(null);
      setAuthError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signup = async (details) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const session = await signupRequest(details);
      setStoredToken(session.token);
      setUser(session.user);
      return session.user;
    } catch (error) {
      setUser(null);
      setAuthError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    clearStoredToken();
    setUser(null);
    setAuthError(null);
    setIsLoadingAuth(false);

    if (shouldRedirect) {
      window.location.href = "/login";
    }
  };

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        isLoadingPublicSettings: isLoadingAuth,
        authError,
        appPublicSettings: {
          id: "tyme-local",
          public_settings: {
            auth_required: true,
          },
        },
        login,
        signup,
        logout,
        navigateToLogin,
        refreshUser: restoreSession,
        checkAppState: restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
