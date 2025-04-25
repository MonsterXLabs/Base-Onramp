export const createCookie = (name: string, value: any) => {
  if (typeof window !== 'undefined') {
    return localStorage.setItem(name, value);
  } else {
    return null;
  }
};

export const getCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(name); // => 'value'
  } else {
    return null;
  }
};

export const removeCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.removeItem(name);
  } else {
    return null;
  }
};
