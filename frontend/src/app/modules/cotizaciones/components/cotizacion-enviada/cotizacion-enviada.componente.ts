import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cotizacion-enviada',
  imports: [CommonModule, RouterLink],
  templateUrl: './cotizacion-enviada.componente.html',
  styleUrl: './cotizacion-enviada.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionEnviadaComponente {
  private readonly route = inject(ActivatedRoute);

  readonly numero = signal('');

  readonly numeroMostrado = computed(() => {
    const numero = this.numero().trim();
    if (numero) {
      return numero;
    }

    const year = new Date().getFullYear();
    return `COT-${year}-0001`;
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.numero.set(params.get('numero') ?? '');
    });
  }
}
