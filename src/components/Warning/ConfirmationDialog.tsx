import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { UIButton } from '@components/ui';

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
        <UIButton variant="ghost" onClick={onClose}>
          No
        </UIButton>
        <UIButton variant="primary" onClick={onConfirm} autoFocus>
          Yes
        </UIButton>
      </DialogActions>
    </Dialog>
  );
};
