const BACKEND_URL = "http://localhost:8081";
const SESSION_TOKEN_COOKIE_NAME = "SESSION-TOKEN";

export type LoginInfo = {
  username: string;
  password: string;
};

export type UserDetails = {
  username: string;
  roles: string[];
};

export const useAuth = () => {
  const login = async (loginInfo: LoginInfo) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(loginInfo),
        credentials: 'include',
      });
      const redirectPath = await response.text();

      return redirectPath;
    } catch (e) {
      console.log("Failed to login: " + e);
      return null;
    }
  };

  const getUsername = () => {
    const sessionTokenString = getCookie(SESSION_TOKEN_COOKIE_NAME) ?? "";
    console.log(sessionTokenString);
    const normalStr = atob(sessionTokenString.split('.').at(1) ?? "");
    console.log(normalStr);
    const data = JSON.parse(normalStr);
    console.log(data);
    return data;
  }

  const logout = async () => {
    try {
      const _response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include',
      });
    } catch {}
  }

  return {
    login: login,
    logout: logout,
    getUsername: getUsername,
  };
}

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

