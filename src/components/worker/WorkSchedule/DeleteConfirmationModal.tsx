import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onConfirm, onCancel }) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Potwierdź usunięcie</DialogTitle>
      </DialogHeader>
      <div className="mt-2">
        <p>Czy na pewno chcesz usunąć ten zakres godzin pracy?</p>
      </div>
      <DialogFooter className="mt-4 flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>
          Anuluj
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Usuń
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteConfirmationModal;
