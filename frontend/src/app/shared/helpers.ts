export class FormatoHelper {
  static formatearDinero(cantidad: number, moneda: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: moneda,
    });
    return formatter.format(cantidad);
  }

  static formatearFecha(fecha: Date | string, formato: string = 'DD/MM/YYYY'): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();

    switch (formato) {
      case 'DD/MM/YYYY':
        return `${dia}/${mes}/${año}`;
      case 'YYYY-MM-DD':
        return `${año}-${mes}-${dia}`;
      case 'DD de MMMM':
        return `${dia} de ${this.obtenerNomesMes(date.getMonth())}`;
      default:
        return date.toString();
    }
  }

  static obtenerNomesMes(mes: number): string {
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    return meses[mes];
  }

  static calcularDescuento(precio: number, porcentaje: number): number {
    return precio - (precio * porcentaje) / 100;
  }

  static validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static generarId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export class PaginacionHelper {
  static paginar<T>(items: T[], pagina: number, itemsPorPagina: number): T[] {
    const inicio = (pagina - 1) * itemsPorPagina;
    const final = inicio + itemsPorPagina;
    return items.slice(inicio, final);
  }

  static calcularTotalPaginas(totalItems: number, itemsPorPagina: number): number {
    return Math.ceil(totalItems / itemsPorPagina);
  }
}

export class BusquedaHelper {
  static buscar<T>(items: T[], termino: string, camposABuscar: (keyof T)[]): T[] {
    if (!termino) return items;

    const terminoMinuscula = termino.toLowerCase();
    return items.filter((item) =>
      camposABuscar.some((campo) =>
        String(item[campo]).toLowerCase().includes(terminoMinuscula)
      )
    );
  }

  static filtrar<T>(items: T[], predicado: (item: T) => boolean): T[] {
    return items.filter(predicado);
  }

  static ordenar<T>(items: T[], campo: keyof T, descendente: boolean = false): T[] {
    const itemsOrdenados = [...items];
    itemsOrdenados.sort((a, b) => {
      const valorA = a[campo];
      const valorB = b[campo];

      if (valorA < valorB) return descendente ? 1 : -1;
      if (valorA > valorB) return descendente ? -1 : 1;
      return 0;
    });
    return itemsOrdenados;
  }
}
