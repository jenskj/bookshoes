import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
} from '@mui/material';

interface ConfirmationDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  isOpen: boolean;
  promptText: string;
}

export const ConfirmationDialog = ({
  onClose,
  isOpen,
  onConfirm,
  promptText,
}: ConfirmationDialogProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {promptText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>No</Button>
        <Button onClick={onConfirm} autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
