import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
// import { useToast } from "@hooks/useToast";
import { UserProps } from "@interfaces/User";
import api from "@services/gateway";
import { getMeData } from "@services/getMeData";
import { useRouter } from "next/navigation";
import { destroyCookie, parseCookies, setCookie } from "nookies";

// import Toast from "@components/Toast";

import { Loading } from "../components/Loading";

interface Props {
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  isAutenticated: boolean;
  setIsAutenticated: Dispatch<SetStateAction<boolean>>;
  userAuth: UserProps | null;
}

export const InitialContext = createContext({} as Props);

export function InitialProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [isAutenticated, setIsAutenticated] = useState(false);
  const [userAuth, setUserAuth] = useState<UserProps | null>(null);
  const router = useRouter();
  // const toast = useToast();

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

      getUser();

      setIsAutenticated(true);
      setLoading(false);
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // toast(
      //   <Toast
      //     title="Ocorreu um erro!"
      //     description="Ocorreu um erro inesperado, por favor tente novamente!"
      //     status="error"
      //   />
      // )
      setLoading(false);
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
      }}
    >
      {loading && <Loading />}

      {children}
    </InitialContext.Provider>
  );
}
