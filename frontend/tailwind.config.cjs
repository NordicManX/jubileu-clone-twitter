module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'azul-cremoso': {
          light: '#f0f8ff',     // Azul bem clarinho
          DEFAULT: '#d9ecff',   // Azul médio
          dark: '#7aaae8',      // Azul mais forte
          texto: '#2a4a6e',     // Azul escuro para texto (adicione esta linha)
          hover: '#4a7bc1'      // Azul para hover
        }
      }
    },
  },
  plugins: [],
}