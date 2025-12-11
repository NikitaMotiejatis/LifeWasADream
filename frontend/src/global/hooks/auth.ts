
// TODO: load from .env
const BACKEND_URL: string = "http://localhost:8081";
const CSRF_TOKEN_NAME: string = "X-XSRF-TOKEN";

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

  const logout = async () => {
    try {
      const _response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include',
      });
    } catch {}
  }

  const userDetailsFetcher = (url: string) =>
    fetch(`${BACKEND_URL}/${url}`, {
      method: "GET",
      headers: {
        [CSRF_TOKEN_NAME]: getCookie(CSRF_TOKEN_NAME) ?? "",
      },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => data as UserDetails);

  return {
    login,
    logout,
    userDetailsFetcher,
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
