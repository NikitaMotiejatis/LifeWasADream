import { createContext, useContext, useState, PropsWithChildren } from 'react';

// TODO: move somewhere more appropriate or read cookie differently
function getCookie(name: string): string | null {
	const nameLenPlus = (name.length + 1);
	return document.cookie
		.split(';')
		.map(c => c.trim())
		.filter(cookie => {
			return cookie.substring(0, nameLenPlus) === `${name}=`;
		})
		.map(cookie => {
			return decodeURIComponent(cookie.substring(nameLenPlus));
		})[0] || null;
}

export type Role = 'Manager' | 'Cashier' | 'Clerk' | 'Supplier';

type AuthContextType = {
  username?: string;
  roles: Role[]; // TODO: make a Set?
  login: (username: string, password: string) => Promise<string | null>;
  checkLoginStatus: () => Promise<string>; // TODO: something a bit more sophisticated than string
  getUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = PropsWithChildren;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [roles, setRoles] = useState<Role[]>([]);

  const login = async (username: string, password: string): Promise<string | null> => {
    const sessionId = "1010110000";
    const loginUrl = `http://localhost:8081/auth/local/login?session=${sessionId}`;
    const requestHeaders = {
      "Content-Type": "application/json",
    };
    const requestBody = {
      user: username,
      passwd: password,
    };

    try {
      const response = await fetch(loginUrl, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
          credentials: "include",
      });

      const { name: resUsername, attrs: { roles: resRoles } } = await response.json();

      if (!resUsername || !resRoles) {
        return "Login failed";
      }

      setUsername(resUsername);
      setRoles(resRoles);
    } catch {
      return "Login failed";
    }

    return null;
  }

  const checkLoginStatus = async () => {
    const url = "http://localhost:8081/auth/local/status";
    const requestHeaders = {
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") ?? "",
    };

    try {
      const response = await fetch(url, {
          method: "GET",
          headers: requestHeaders,
          credentials: "include",
      });

      const obj = await response.json();

    } catch {
      console.error("Failed to get login status");
    }

    return "";
  };

  const getUser = async () => {
    const url = "http://localhost:8081/auth/local/user";
    const requestHeaders = {
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") ?? "",
    };

    try {
      const response = await fetch(url, {
          method: "GET",
          headers: requestHeaders,
          credentials: "include",
      });

      const { user: resUsername, attrs: { roles: resRoles } } = await response.json();

      if (!resUsername || !resRoles) {
        console.error("Failed to get user info");
        return;
      }

      setUsername(resUsername);
      setRoles(resRoles);
    } catch {
      console.error("Failed to get user info");
    }
  }

  const logout = async () => {
    const url = "http://localhost:8081/auth/local/logout";
    const requestHeaders = {
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") ?? "",
    };

    try {
      const _ = await fetch(url, {
          method: "POST",
          headers: requestHeaders,
          credentials: "include",
      });

      setUsername(undefined);
      setRoles([]);
    } catch {
      console.error("Failed to logout.");
    }
  }

  return (
    <AuthContext.Provider value={{ 
      username: username, 
      roles: roles,
      login: login,
      checkLoginStatus: checkLoginStatus,
      getUser: getUser,
      logout: logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Failed to get auth context");
  }
  return context;
};
