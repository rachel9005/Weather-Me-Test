import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';  

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSnackBarModule  
  ],
  exports: [
    MatIconModule, 
    MatButtonModule, 
    MatAutocompleteModule, 
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSnackBarModule  
  ],
})
export class SharedModule { }
