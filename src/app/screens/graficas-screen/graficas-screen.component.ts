import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EventosAcademicosService } from 'src/app/services/eventos-academicos.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss'],
})
export class GraficasScreenComponent implements OnInit {
  //Variables

  public total_user: any = {};
  public totalUsuarios: any = {};
  public total_eventos: any = {};
  public totalEventos: any = {};

  //Histograma
  lineChartData = {
    labels: ['Talleres', 'Seminarios', 'Conferencias', 'Concursos'],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de Eventos',
        backgroundColor: '#F88406',
      },
    ],
  };
  lineChartOption = {
    responsive: true,
  };
  lineChartPlugins = [DatalabelsPlugin];

  //Barras
  barChartData = {
    labels: ['Talleres', 'Seminarios', 'Conferencias', 'Concursos'],
    datasets: [
      {
        data: [] as number[],
        label: 'Eventos Académicos',
        backgroundColor: ['#F88406', '#FCFF44', '#82D3FB', '#FB82F5'],
      },
    ],
  };
  barChartOption = {
    responsive: false,
  };
  barChartPlugins = [DatalabelsPlugin];

  //Circular
  pieChartData = {
    labels: ['Administradores', 'Alumnos', 'Maestros'],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de usuarios',
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731'],
      },
    ],
  };
  pieChartOption = {
    responsive: true,
  };
  pieChartPlugins = [DatalabelsPlugin];

  // Doughnut
  doughnutChartData = {
    labels: ['Administradores', 'Alumnos', 'Maestros'],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7'],
      },
    ],
  };
  doughnutChartOption = {
    responsive: true,
  };
  doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private administradoresServices: AdministradoresService,
    private eventosService: EventosAcademicosService
  ) {}

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerTotalEventos();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        console.log('Total usuarios: ', this.total_user);
        this.totalUsuarios = [
          this.total_user.admins,
          this.total_user.alumnos,
          this.total_user.maestros,
        ];

        this.graficaUsuarios();
      },
      (error) => {
        console.log('Error al obtener total de usuarios ', error);

        alert('No se pudo obtener el total de cada rol de usuarios');
      }
    );
  }

  public obtenerTotalEventos() {
    this.eventosService.getTotalEventos().subscribe(
      (response) => {
        this.total_eventos = response;
        console.log('Total eventos: ', this.total_eventos);

        this.totalEventos = [
          this.total_eventos.talleres,
          this.total_eventos.seminarios,
          this.total_eventos.conferencias,
          this.total_eventos.concurso,
        ];

        this.graficaEventos();
      },
      (error) => {
        console.log('Error al obtener total de eventos ', error);
        alert('No se pudo obtener el total de eventos por tipo');
      }
    );
  }

  private graficaEventos(): void {
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: this.totalEventos,
        },
      ],
    };

    this.barChartData = {
      ...this.barChartData,
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: this.totalEventos,
        },
      ],
    };
  }

  private graficaUsuarios(): void {
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: this.totalUsuarios,
        },
      ],
    };

    this.pieChartData = {
      ...this.pieChartData,
      datasets: [
        {
          ...this.pieChartData.datasets[0],
          data: this.totalUsuarios,
        },
      ],
    };
  }
}
