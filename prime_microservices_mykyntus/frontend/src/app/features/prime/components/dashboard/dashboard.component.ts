import { Component, OnInit } from '@angular/core';
import { DashboardDataService, DashboardStats, AuditLogRow } from '../../services/dashboard-data.service';

type DashboardSection = 'journal' | 'historique' | 'reporting' | 'anomalies';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  section: DashboardSection = 'journal';
  stats?: DashboardStats;
  logs: AuditLogRow[] = [];
  loading = true;

  constructor(private readonly dashboardDataService: DashboardDataService) {}

  ngOnInit(): void {
    // #region agent log
    fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'angular-dashboard-pre-fix',hypothesisId:'A1',location:'dashboard.component.ts:22',message:'Angular dashboard init',data:{initialSection:this.section},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    this.dashboardDataService.getDashboardStats().subscribe((stats) => {
      this.stats = stats;
      // #region agent log
      fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'angular-dashboard-pre-fix',hypothesisId:'A2',location:'dashboard.component.ts:30',message:'Stats loaded',data:{hasStats:!!stats,totalEvents:stats?.totalEvents},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      this.finishLoadingIfReady();
    });

    this.dashboardDataService.getAuditLogs().subscribe((rows) => {
      this.logs = Array.isArray(rows) ? rows : [];
      // #region agent log
      fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'angular-dashboard-pre-fix',hypothesisId:'A3',location:'dashboard.component.ts:39',message:'Audit logs loaded',data:{isArray:Array.isArray(rows),count:Array.isArray(rows)?rows.length:-1,firstId:Array.isArray(rows)&&rows.length>0?rows[0]?.id:null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      this.finishLoadingIfReady();
    });
  }

  setSection(section: DashboardSection): void {
    this.section = section;
    // #region agent log
    fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'angular-dashboard-pre-fix',hypothesisId:'A4',location:'dashboard.component.ts:50',message:'Section changed',data:{section},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }

  private finishLoadingIfReady(): void {
    if (this.stats && this.logs.length >= 0) {
      this.loading = false;
      // #region agent log
      fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'angular-dashboard-pre-fix',hypothesisId:'A5',location:'dashboard.component.ts:59',message:'Dashboard ready',data:{loading:this.loading,hasStats:!!this.stats,logCount:this.logs.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }
  }
}
