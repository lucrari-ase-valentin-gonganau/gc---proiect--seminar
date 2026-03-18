/**
 * Utilitare pentru mesaje si notificari
 */

const MSG_STYLES = {
  default: { color: "white", fontSize: "14px", fontWeight: "600" },
  success: { color: "#4ade80", fontSize: "14px", fontWeight: "700" },
  warning: { color: "#fbbf24", fontSize: "14px", fontWeight: "700" },
  error: { color: "#f87171", fontSize: "14px", fontWeight: "700" },
  info: { color: "#60a5fa", fontSize: "14px", fontWeight: "700" },
  highlight: { color: "#c084fc", fontSize: "15px", fontWeight: "700" },
};

/**
 * Seteaza mesaj cu stil specific
 * @param {HTMLElement} msgElement - Elementul de mesaj
 * @param {string} text - Textul mesajului
 * @param {string} type - Tipul: 'default', 'success', 'warning', 'error', 'info', 'highlight'
 * @param {number} duration - Durata in ms dupa care revine la default (0 = nu revine)
 */
export function setMessage(msgElement, text, type = "default", duration = 0) {
  const style = MSG_STYLES[type] || MSG_STYLES.default;

  msgElement.textContent = text;
  msgElement.style.color = style.color;
  msgElement.style.fontSize = style.fontSize;
  msgElement.style.fontWeight = style.fontWeight;

  if (duration > 0) {
    setTimeout(() => {
      setMessage(msgElement, "Folosește săgețile pentru a conduce!", "default");
    }, duration);
  }
}
