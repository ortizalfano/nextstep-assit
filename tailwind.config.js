/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'midnight-blue': 'var(--midnight-blue)',
                'mint-green': 'var(--mint-green)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'lg': 'var(--radius-lg)',
                'xl': 'var(--radius-xl)',
            }
        },
    },
    plugins: [],
}
