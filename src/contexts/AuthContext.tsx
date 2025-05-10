import Cookies from "js-cookie";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

export interface AuthContextProps {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = () => {
    window.location.href = `/api/v1/auth/google`;
  };

  const signOut = () => {
    fetch("/api/v1/auth/logout", { method: "POST" })
      .then((res) => {
        if (res.ok) {
          window.location.reload();
        }
      })
      .catch(() => toast.error('Failed to sign out'));
  };

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get("authenticated"));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
