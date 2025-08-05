/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'buzzmark-blue': '#1e3a8a',
        primary: '#4361ee',
         primaryDark: '#3a56d4',
        secondary: '#4cc9f0',
        secondaryDark: '#3db8df',
        dark: '#333',
        light: '#f4f4f4',
        danger: '#f72585',
        dangerDark: '#e01f71',
        success: '#4cc9f0',
        successDark: '#3db8df',
        warning: '#f8961e',
        warningDark: '#e88613',
      
         // You can adjust this color value as needed
},
boxShadow: {
        card: '0 10px 20px rgba(0, 0, 0, 0.08)',
        hover: '0 15px 30px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        speed: '300ms',
      },
    },
  },
  plugins: [],
}
