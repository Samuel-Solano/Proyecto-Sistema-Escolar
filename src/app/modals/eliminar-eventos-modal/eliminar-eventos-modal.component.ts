import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventosAcademicosService } from 'src/app/services/eventos-academicos.service';

@Component({
  selector: 'app-eliminar-eventos-modal',
  templateUrl: './eliminar-eventos-modal.component.html',
  styleUrls: ['./eliminar-eventos-modal.component.scss'],
})
export class EliminarEventosModalComponent implements OnInit {
  public evento: string = '';

  constructor(
    private eventosService: EventosAcademicosService,
    private dialogRef: MatDialogRef<EliminarEventosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.evento = this.data?.evento || 'evento';
  }

  public cerrar_modal() {
    this.dialogRef.close({ isDelete: false });
  }

  public eliminarEvento() {
    console.log('Click en eliminarEvento, id:', this.data.id);

    this.eventosService.eliminarEvento(this.data.id).subscribe(
      (response) => {
        console.log('Respuesta backend eliminarEvento:', response);
        this.dialogRef.close({ isDelete: true });
      },
      (error) => {
        console.error('Error al eliminar evento:', error);
        this.dialogRef.close({ isDelete: false });
      }
    );
  }
}
