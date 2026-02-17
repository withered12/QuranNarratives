/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: '#D4AF37', // Gold
                secondary: '#1A1A1A', // Dark Gray
                background: '#121212', // Very Dark Gray
                text: '#E0E0E0', // Light Gray
            },
            fontFamily: {
                uthmani: ['KFGQPC Uthman Taha Naskh', 'sans-serif'], // Placeholder
            }
        },
    },
    plugins: [],
}
