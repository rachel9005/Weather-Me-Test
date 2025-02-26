import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor(private snackBar: MatSnackBar) { }

    // Method to show messages using MatSnackBar
    showError(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-toast']
        });
    }

    showSuccess(message: string) {
        this.snackBar.open(message, 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
    }
}

