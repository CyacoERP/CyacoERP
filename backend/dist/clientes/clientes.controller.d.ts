import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { ConsultarClientesDto } from './dto/consultar-clientes.dto';
export declare class ClientesController {
    private readonly clientesService;
    constructor(clientesService: ClientesService);
    crear(dto: CrearClienteDto): Promise<{
        razonSocial: string;
        rfc: string;
        email: string | null;
        telefono: string | null;
        sector: string | null;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        id: number;
    }>;
    listar(query: ConsultarClientesDto): Promise<{
        datos: {
            razonSocial: string;
            rfc: string;
            email: string | null;
            telefono: string | null;
            sector: string | null;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
            id: number;
        }[];
        meta: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    obtenerPorId(id: number): Promise<{
        razonSocial: string;
        rfc: string;
        email: string | null;
        telefono: string | null;
        sector: string | null;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        id: number;
    }>;
    actualizar(id: number, dto: ActualizarClienteDto): Promise<{
        razonSocial: string;
        rfc: string;
        email: string | null;
        telefono: string | null;
        sector: string | null;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        id: number;
    }>;
    desactivar(id: number): Promise<{
        razonSocial: string;
        rfc: string;
        email: string | null;
        telefono: string | null;
        sector: string | null;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        id: number;
    }>;
}
