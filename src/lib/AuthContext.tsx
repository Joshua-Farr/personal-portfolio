import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  getBillingAuth,
  isFirebaseConfigured,
} from "./firebase";

export type AppRole = "admin" | "client" | null;

export type AuthState = {
  user: User | null;
  role: AppRole;
  clientId: string | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

async function readClaims(user: User): Promise<{
  role: AppRole;
  clientId: string | null;
}> {
  const token = await user.getIdTokenResult(true);
  const role =
    token.claims.role === "admin" || token.claims.role === "client"
      ? token.claims.role
      : null;
  const clientId =
    typeof token.claims.clientId === "string" ? token.claims.clientId : null;
  return { role, clientId };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const auth = getBillingAuth();
    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next);
      if (next) {
        const claims = await readClaims(next);
        setRole(claims.role);
        setClientId(claims.clientId);
      } else {
        setRole(null);
        setClientId(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getBillingAuth(), email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(getBillingAuth());
  };

  const refreshClaims = async () => {
    const current = getBillingAuth().currentUser;
    if (!current) return;
    const claims = await readClaims(current);
    setRole(claims.role);
    setClientId(claims.clientId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        clientId,
        loading,
        configured,
        signIn,
        signOut,
        refreshClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
