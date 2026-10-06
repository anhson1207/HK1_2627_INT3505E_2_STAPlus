import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#007f9b",
            dark: "#006278",
            light: "#bee3e8",
        },
        success: {
            main: "#00a86b",
        },
        warning: {
            main: "#d98c00",
        },
        error: {
            main: "#d83a52",
        },
        background: {
            default: "#f6f7fb",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#323338",
            secondary: "#676879",
        },
        divider: "#e6e9ef",
    },

    typography: {
        fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

        h1: {
            fontSize: "24px",
            fontWeight: 600,
        },

        h2: {
            fontSize: "24px",
            fontWeight: 600,
        },

        h3: {
            fontSize: "20px",
            fontWeight: 600,
        },

        body1: {
            fontSize: "14px",
        },

        body2: {
            fontSize: "13px",
        },
    },

    shape: {
        borderRadius: 8,
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 6,
                    boxShadow: "none",
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    border: "1px solid #e6e9ef",
                    boxShadow: "none",
                    borderRadius: 8,
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                size: "small",
            },
        },
    },
});
