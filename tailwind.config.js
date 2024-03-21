/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./views/**/*.{html,js,ejs}", "./components/views/**/*.{html,js,ejs}", "./public/scripts/**/*.{html,js,ejs}"],
    theme: {
        extend: {
            fontFamily: {
                'Rajdhani': ["Rajdhani", "sans-serif"]
            }
        },
    },
    plugins: [],
}