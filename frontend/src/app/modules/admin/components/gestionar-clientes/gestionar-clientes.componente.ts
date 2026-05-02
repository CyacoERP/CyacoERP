import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteServicio } from '../../services/cliente.servicio';
import { Cliente, CrearClientePayload, ActualizarClientePayload } from '../../models/cliente.modelo';

type ModoModal = 'crear' | 'editar';

interface FormCliente {
  razonSocial: string;
  rfc: string;
  email: string;
  telefono: string;
  sector: string;
}

@Component({
  selector: 'app-gestionar-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-clientes.componente.html',
  styleUrl: './gestionar-clientes.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionarClientesComponente implements OnInit {
  private readonly clienteServicio = inject(ClienteServicio);

  readonly clientes = signal<Cliente[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly totalPaginas = signal(1);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly termino = signal('');

  readonly mostrarModal = signal(false);
  readonly modoModal = signal<ModoModal>('crear');
  readonly clienteEditando = signal<Cliente | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');

  readonly mostrarConfirmDesactivar = signal(false);
  readonly clienteADesactivar = signal<Cliente | null>(null);

  readonly form = signal<FormCliente>({
    razonSocial: '',
    rfc: '',
    email: '',
    telefono: '',
    sector: '',
  });

  readonly paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.clienteServicio.listar(this.pagina(), 15, this.termino()).subscribe({
      next: (resp) => {
        this.clientes.set(resp.datos ?? []);
        this.total.set(resp.total ?? 0);
        this.totalPaginas.set(resp.totalPaginas ?? 1);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar la lista de clientes.');
        this.cargando.set(false);
      },
    });
  }

  buscar(event: Event): void {
    this.termino.set((event.target as HTMLInputElement).value ?? '');
    this.pagina.set(1);
    this.cargar();
  }

  irAPagina(p: number): void {
    this.pagina.set(p);
    this.cargar();
  }

  abrirCrear(): void {
    this.modoModal.set('crear');
    this.clienteEditando.set(null);
    this.form.set({ razonSocial: '', rfc: '', email: '', telefono: '', sector: '' });
    this.errorModal.set('');
    this.mostrarModal.set(true);
  }

  abrirEditar(cliente: Cliente): void {
    this.modoModal.set('editar');
    this.clienteEditando.set(cliente);
    this.form.set({
      razonSocial: cliente.razonSocial,
      rfc: cliente.rfc,
      email: cliente.email,
      telefono: cliente.telefono ?? '',
      sector: cliente.sector ?? '',
    });
    this.errorModal.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  actualizarCampo(campo: keyof FormCliente, valor: string): void {
    this.form.update((f) => ({ ...f, [campo]: valor }));
  }

  guardar(): void {
    const f = this.form();
    if (!f.razonSocial.trim() || !f.rfc.trim() || !f.email.trim()) {
      this.errorModal.set('Razón social, RFC y email son requeridos.');
      return;
    }

    this.guardando.set(true);
    this.errorModal.set('');

    if (this.modoModal() === 'crear') {
      const payload: CrearClientePayload = {
        razonSocial: f.razonSocial.trim(),
        rfc: f.rfc.trim().toUpperCase(),
        email: f.email.trim().toLowerCase(),
        telefono: f.telefono.trim() || undefined,
        sector: f.sector.trim() || undefined,
      };
      this.clienteServicio.crear(payload).subscribe({
        next: () => this.onGuardadoOk(),
        error: (err) => this.onGuardadoError(err),
      });
    } else {
      const id = this.clienteEditando()?.id;
      if (!id) return;
      const payload: ActualizarClientePayload = {
        razonSocial: f.razonSocial.trim(),
        email: f.email.trim().toLowerCase(),
        telefono: f.telefono.trim() || undefined,
        sector: f.sector.trim() || undefined,
      };
      this.clienteServicio.actualizar(id, payload).subscribe({
        next: () => this.onGuardadoOk(),
        error: (err) => this.onGuardadoError(err),
      });
    }
  }

  confirmarDesactivar(cliente: Cliente): void {
    this.clienteADesactivar.set(cliente);
    this.mostrarConfirmDesactivar.set(true);
  }

  cancelarDesactivar(): void {
    this.mostrarConfirmDesactivar.set(false);
    this.clienteADesactivar.set(null);
  }

  ejecutarDesactivar(): void {
    const c = this.clienteADesactivar();
    if (!c) return;
    this.clienteServicio.desactivar(c.id).subscribe({
      next: () => {
        this.mostrarConfirmDesactivar.set(false);
        this.clienteADesactivar.set(null);
        this.cargar();
      },
      error: () => {
        this.mostrarConfirmDesactivar.set(false);
      },
    });
  }

  private onGuardadoOk(): void {
    this.guardando.set(false);
    this.mostrarModal.set(false);
    this.cargar();
  }

  private onGuardadoError(err: { error?: { message?: string } }): void {
    this.guardando.set(false);
    const msg = err?.error?.message ?? 'Error al guardar. Verifica los datos.';
    this.errorModal.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
  }
}
