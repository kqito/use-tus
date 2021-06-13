module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      transitionTimingFunction: {
        loading: 'cubic-bezier(0, 1, 1, 0)',
      },
      keyframes: {
        'loader-dots1': {
          '0%': {
            transform: 'scale(0)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        'loader-dots2': {
          '0%': {
            transform: 'translate(0, 0)',
          },
          '100%': {
            transform: 'translate(24px, 0)',
          },
        },
        'loader-dots3': {
          '0%': {
            transform: 'scale(1)',
          },
          '100%': {
            transform: 'scale(0)',
          },
        },
      },
      animation: {
        loader1: 'loader-dots1 0.6s infinite',
        loader2: 'loader-dots2 0.6s infinite',
        loader3: 'loader-dots3 0.6s infinite',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['disabled'],
      textColor: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
};
