import { LibreriaSession } from "./libreria-session.mjs";

/**
 * Renderiza los mensajes en el contenedor especificado
 * @param {string} containerSelector - Selector del contenedor (ej: "#mensajesContainer")
 */
export function renderMensajes(containerSelector = "#mensajesContainer") {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const mensajes = LibreriaSession.getMessages();
  
  if (mensajes.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Renderizar mensajes
  container.innerHTML = mensajes.map(msg => {
    const typeClass = getTypeClass(msg.type);
    return `
      <div class="${typeClass}" data-message-id="${msg.id}">
        ${escapeHtml(msg.text)}
        <span class="x" onclick="window.closeMensaje(${msg.id})">✕</span>
      </div>
    `;
  }).join('');
}

/**
 * Renderiza solo el último mensaje (útil para mostrar feedback inmediato)
 * @param {string} containerSelector - Selector del contenedor
 */
export function renderUltimoMensaje(containerSelector = "#mensajesContainer") {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const mensajes = LibreriaSession.getMessages();
  
  if (mensajes.length === 0) {
    container.innerHTML = "";
    return;
  }

  const ultimo = mensajes[mensajes.length - 1];
  const typeClass = getTypeClass(ultimo.type);
  
  container.innerHTML = `
    <div class="${typeClass}" data-message-id="${ultimo.id}">
      ${escapeHtml(ultimo.text)}
      <span class="x" onclick="window.closeMensaje(${ultimo.id})">✕</span>
    </div>
  `;
}

/**
 * Cierra un mensaje específico
 * @param {number} messageId - ID del mensaje a cerrar
 */
export function closeMensaje(messageId) {
  // Eliminar el elemento visualmente primero (con animación)
  const elemento = document.querySelector(`[data-message-id="${messageId}"]`);
  if (elemento) {
    elemento.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    elemento.style.opacity = '0';
    elemento.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      elemento.remove();
      
      // Si no quedan más mensajes visibles, limpiar el contenedor
      const container = elemento.parentElement;
      if (container && container.children.length === 0) {
        container.innerHTML = '';
      }
    }, 300);
  }
  
  // Eliminar del localStorage
  const mensajes = LibreriaSession.getMessages().filter(msg => msg.id !== messageId);
  LibreriaSession.clearMessages();
  mensajes.forEach(msg => {
    LibreriaSession.addMessage(msg.type, msg.text, { persist: true });
  });
}

/**
 * Limpia todos los mensajes
 * @param {string} containerSelector - Selector del contenedor
 */
export function clearMensajes(containerSelector = "#mensajesContainer") {
  LibreriaSession.clearMessages();
  const container = document.querySelector(containerSelector);
  if (container) container.innerHTML = "";
}

/**
 * Mapea el tipo de mensaje a la clase CSS correspondiente
 */
function getTypeClass(type) {
  const typeMap = {
    'error': 'error',
    'success': 'message',
    'info': 'message',
    'log': 'log',
    'warn': 'log'
  };
  return typeMap[type] || 'message';
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exponer closeMensaje globalmente para que funcione el onclick
if (typeof window !== 'undefined') {
  window.closeMensaje = closeMensaje;
}