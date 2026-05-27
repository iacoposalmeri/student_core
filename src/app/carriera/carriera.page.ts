import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-carriera',
  templateUrl: './carriera.page.html',
  styleUrls: ['./carriera.page.scss'],
  standalone: false
})
export class CarrieraPage implements OnInit {

  esamiSuperati: any[] = [];

  totaleCfu : number = 0;
  mediaVoti: number = 0;
  votoLaurea: number = 0;

  idStudente : string | null = null;

  isLoadingEsami: boolean = true;

  constructor(
    private http: HttpClient, 
  ) { }

  ngOnInit() {
    this.idStudente = localStorage.getItem('id');

    this.http.get<any[]>("http://localhost:3000/api/esami/" + this.idStudente).subscribe({
      next: (data) => {
        this.esamiSuperati = data;
        this.calcolaStatistiche();
        this.isLoadingEsami = false;
      },
      error: (err) => {
        console.error("Errore esami:", err);
        this.isLoadingEsami = false;
      }
    });
    
  }

  calcolaStatistiche() {
    this.totaleCfu = 0;
    this.mediaVoti = 0;
    var sommaPonderata = 0;

    this.esamiSuperati.forEach(esame => {
      this.totaleCfu += esame.cfu;
      sommaPonderata += (esame.voto * esame.cfu);
    })
    if (this.totaleCfu>0) {
      this.mediaVoti = sommaPonderata / this.totaleCfu;
      this.votoLaurea = this.mediaVoti / 30 * 110;
    }
  }

}
