/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cy: {
                    primary: '#6366F1',
                    dark: '#0F172A',
                    accent: '#F43F5E',
                    teal: '#2DD4BF',
                    surface: '#F1F5F9',
                    text: '#1E293B',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(99, 102, 241, 0.2)',
                'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                'gradient-accent': 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
            }
        }
    },
    plugins: [],
}
