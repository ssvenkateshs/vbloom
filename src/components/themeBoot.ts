export const themeStorageKey = "vbloom-theme";

/** Applies a saved or ?theme= palette before first paint, so there is no flash. */
export const themeBootScript = `try{var q=new URLSearchParams(location.search).get("theme");var t=q||localStorage.getItem("${themeStorageKey}");if(t&&t!=="bliss")document.documentElement.dataset.theme=t;if(q)localStorage.setItem("${themeStorageKey}",q)}catch(e){}`;
