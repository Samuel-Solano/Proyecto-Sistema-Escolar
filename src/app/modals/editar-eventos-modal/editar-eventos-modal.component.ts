import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-editar-eventos-modal',
  templateUrl: './editar-eventos-modal.component.html',
  styleUrls: ['./editar-eventos-modal.component.scss'],
})
export class EditarEventosModalComponent {
  public mensaje: string = '';

  constructor(
    private dialogRef: MatDialogRef<EditarEventosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mensaje = data?.mensaje || '¿Estás seguro de actualizar este evento?';
  }

  public cerrar_modal() {
    this.dialogRef.close({ confirmar: false });
  }

  public confirmar() {
    this.dialogRef.close({ confirmar: true });
  }
}
