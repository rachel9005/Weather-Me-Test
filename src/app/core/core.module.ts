import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.registerCustomIcons();
  }

  // Function to register custom SVG icons with MatIconRegistry
  private registerCustomIcons() {
    this.matIconRegistry.addSvgIcon(
      'search-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/search-icon.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'favorite-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/favorite-icon.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'empty-favorite-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/empty-favorite-icon.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'circle-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/circle-icon.svg')
    );
  }
}
