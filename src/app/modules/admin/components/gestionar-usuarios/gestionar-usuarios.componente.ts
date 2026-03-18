import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { Usuario } from '../../../../shared/models/usuario.modelo';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-usuarios.componente.html',
  styleUrl: './gestionar-usuarios.componente.css',
})
export class GestionarUsuariosComponente implements OnInit {
  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);

  constructor(private usuarioServicio: UsuarioServicio) {}

  ngOnInit() {
    this.usuarioServicio.obtenerTodos().subscribe({
      next: (datos: any) => {
        this.usuarios.set(datos || []);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.cargando.set(false);
      },
    });
  }
}
