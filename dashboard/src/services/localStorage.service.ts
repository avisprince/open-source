const ACCESS_TOKEN = 'ACCESS_TOKEN';

export const saveAccessToken = (accessToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN);
};

export const clearAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN);
};
