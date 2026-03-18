import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoServicio } from '../../services/contacto.servicio';

@Component({
  selector: 'app-formulario-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-contacto.componente.html',
  styleUrl: './formulario-contacto.componente.css',
})
export class FormularioContactoComponente {
  nombre = '';
  email = '';
  asunto = '';
  mensaje = '';
  enviado = false;

  constructor(private contactoServicio: ContactoServicio) {}

  enviar() {
    const datos = {
      nombre: this.nombre,
      email: this.email,
      asunto: this.asunto,
      mensaje: this.mensaje,
    };

    this.contactoServicio.enviarMensaje(datos).subscribe({
      next: () => {
        this.enviado = true;
        this.nombre = '';
        this.email = '';
        this.asunto = '';
        this.mensaje = '';
      },
      error: (err: any) => {
        console.error('Error', err);
      },
    });
  }
}
