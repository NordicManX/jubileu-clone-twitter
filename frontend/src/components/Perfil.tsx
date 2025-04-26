// src/pages/Perfil.tsx
import React from "react";
import Timeline from "./Timeline"; // Importe o componente Timeline que já contém a Sidebar e o Main

/**
 * Componente Perfil
 *
 * Este componente agora atua principalmente como um container ou ponto de entrada
 * para renderizar o componente Timeline. A lógica de layout principal
 * (Sidebar + área de conteúdo principal) é gerenciada DENTRO do componente Timeline.
 */
const Perfil = () => {
  // AVISO: Lógica de estado para modal (mostrarModal, novoNome, novoEmail) e a renderização
  // direta da Sidebar foram removidas daqui. Assume-se que o componente Timeline
  // já gerencia seu próprio estado de modal (se necessário) e renderiza
  // sua própria Sidebar internamente com as props corretas buscadas/gerenciadas lá.
  // Se você precisar passar dados específicos para o Timeline, pode fazer via props:
  // Ex: <Timeline algumaProp="valor" />

  // Renderiza APENAS o componente Timeline.
  // O Timeline é responsável pelo seu próprio layout interno (Sidebar + Main).
  return (
    <Timeline />
  );
};

export default Perfil;