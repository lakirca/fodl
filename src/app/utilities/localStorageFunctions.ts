export const saveToLocalStorage = (key, value) => {
    window.localStorage.setItem(key, value);
};
export const getFromLocalStorage = (key) => {
    return window.localStorage.getItem(key);
};
