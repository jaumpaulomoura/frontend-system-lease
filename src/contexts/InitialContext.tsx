import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { UserProps } from "@interfaces/User";
import api from "@services/gateway";
import { getMeData } from "@services/getMeData";
import { useRouter } from "next/navigation";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { Loading } from "../components/Loading";

interface Props {
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  isAutenticated: boolean;
  setIsAutenticated: Dispatch<SetStateAction<boolean>>;
  userAuth: UserProps | null;
  showLoginSuccess: boolean;
  setShowLoginSuccess: Dispatch<SetStateAction<boolean>>;
}

export const InitialContext = createContext({} as Props);

export function InitialProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [isAutenticated, setIsAutenticated] = useState(false);
  const [userAuth, setUserAuth] = useState<UserProps | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const router = useRouter();

  const getUser = async () => {
    const userLogged = await getMeData();

    if (userLogged.id) {
      setUserAuth(userLogged);
      setCookie(undefined, "validateU", `${userLogged.role}`, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }
  };

  const userInfo = useCallback(async () => {
    const cookies = parseCookies();

    if (cookies.auth_token) {
      setIsAutenticated(true);
      getUser();
    }
  }, []);

  useEffect(() => {
    userInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(email: string, password: string) {
    setLoading(true);

    try {
      const response = await api.post<{ accessToken: string }>("/api/auth/", {
        email,
        password,
      });

      const accessToken = response.data.accessToken;

      if (!accessToken) {
        setLoading(false);
        return false;
      }

      setCookie(undefined, "auth_token", accessToken, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      await getUser();

      setIsAutenticated(true);
      setShowLoginSuccess(true); // Ativa o alerta de bem-vindo
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  function signOut() {
    destroyCookie(null, "auth_token");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 1000);
  }

  return (
    <InitialContext.Provider
      value={{
        loading,
        setLoading,
        isAutenticated,
        setIsAutenticated,
        signIn,
        signOut,
        userAuth,
        showLoginSuccess,
        setShowLoginSuccess,
      }}
    >
      {loading && <Loading />}
      {children}
    </InitialContext.Provider>
  );
}
