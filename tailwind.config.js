/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#bf9540", // Gold
                "background-dark": "#0a0c14", // Deep Midnight Blue
                midnight: "#111827", // Secondary dark
                cream: "#F5F5DC",
                "gold-light": "#e5c17d",
                "gold-dark": "#8c6a26",
            },
            fontFamily: {
                display: ["Cinzel_700Bold"],
                body: ["Lato_400Regular"],
                reading: ["Newsreader_400Regular"],
                arabic: ["Amiri_400Regular"],
            },
        },
    },
    plugins: [],
};
