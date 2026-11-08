import { createTheme, type Theme } from "@mui/material/styles";
import type { ThemeMode } from "./stores/themeStore";

export function getAppTheme(mode: ThemeMode = "light"): Theme {
    const isDark = mode === "dark";

    return createTheme({
        palette: {
            mode,
            primary: {
                main: "#007f9b",
                dark: "#006278",
                light: isDark ? "#183e46" : "#e8f5f7",
                contrastText: "#ffffff",
            },
            success: {
                main: "#00c875",
            },
            warning: {
                main: "#fdab3d",
            },
            error: {
                main: "#e2445c",
            },
            background: {
                default: isDark ? "#171820" : "#f6f7fb",
                paper: isDark ? "#20212b" : "#ffffff",
            },
            text: {
                primary: isDark ? "#f1f2f5" : "#323338",
                secondary: isDark ? "#b7bac5" : "#676879",
            },
            divider: isDark ? "#30333e" : "#e6e9ef",
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
                        border: `1px solid ${isDark ? "#3a3d49" : "#d0d4e4"}`,
                        boxShadow: "none",
                        borderRadius: 8,
                        backgroundColor: isDark ? "#20212b" : "#ffffff",
                    },
                },
            },

            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                        backgroundColor: isDark ? "#20212b" : "#ffffff",
                        color: isDark ? "#f1f2f5" : "#323338",
                    },
                },
            },

            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderColor: isDark ? "#30333e" : "#e6e9ef",
                        color: isDark ? "#f1f2f5" : "#323338",
                    },
                    head: {
                        backgroundColor: isDark ? "#252731" : "#f7f8fa",
                        color: isDark ? "#b7bac5" : "#676879",
                        fontWeight: 600,
                    },
                },
            },

            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? "#252731" : "#ffffff",
                        color: isDark ? "#f1f2f5" : "#323338",
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: isDark ? "#3a3d49" : "#d0d4e4",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: isDark ? "#505361" : "#b6bac9",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#007f9b",
                        },
                    },
                    input: {
                        color: isDark ? "#f1f2f5" : "#323338",
                    },
                },
            },

            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: isDark ? "#b7bac5" : "#676879",
                        "&.Mui-focused": {
                            color: "#007f9b",
                        },
                    },
                },
            },

            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        color: isDark ? "#f1f2f5" : "#323338",
                        "&:hover": {
                            backgroundColor: isDark ? "#2d2f3a" : "#f1f3f6",
                        },
                        "&.Mui-selected": {
                            backgroundColor: isDark ? "#183e46" : "#e9f5f7",
                            "&:hover": {
                                backgroundColor: isDark ? "#1d4b55" : "#dbeef1",
                            },
                        },
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
}

export const theme = getAppTheme("light");
