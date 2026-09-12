import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Xóa",
    cancelLabel = "Hủy",
    loading = false,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: "0 24px 20px" }}>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    {cancelLabel}
                </Button>
                <Button onClick={onConfirm} disabled={loading} color="error" variant="contained">
                    {loading ? "Đang xóa..." : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
