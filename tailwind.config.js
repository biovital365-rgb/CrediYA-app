/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cy: {
                    primary: '#F97316', // Orange
                    secondary: '#FB923C', // Lighter Orange
                    success: '#10B981', // Emerald Green
                    dark: '#0F172A',
                    accent: '#8B5CF6', // Purple as contrast
                    surface: {
                        light: '#F8FAFC',
                        dark: '#020617'
                    },
                    text: {
                        light: '#1E293B',
                        dark: '#F8FAFC'
                    }
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(249, 115, 22, 0.2)',
                'glow': '0 0 15px rgba(249, 115, 22, 0.4)',
                'glow-green': '0 0 15px rgba(16, 185, 129, 0.4)',
            },
            backgroundImage: {
                'gradient-premium': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'gradient-combined': 'linear-gradient(135deg, #F97316 0%, #10B981 100%)',
            }
        }
    },
    plugins: [],
}
