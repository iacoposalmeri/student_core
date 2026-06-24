import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminDashboardPage } from './admin-dashboard.page';

import { AdminHelpDeskPage} from '../admin-help-desk/admin-help-desk.page';
import { AdminAnalyticsPage} from '../admin-analytics/admin-analytics.page';
import { AdminCampusPage} from '../admin-campus/admin-campus.page';
import { AdminDidatticaPage} from '../admin-didattica/admin-didattica.page';
import { AdminModerazionePage} from '../admin-moderazione/admin-moderazione.page';
import { AdminAvvisiPage} from '../admin-avvisi/admin-avvisi.page';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardPage,
    children: [
      { path: '', redirectTo: 'avvisi', pathMatch: 'full' },
      { path: 'avvisi', component: AdminAvvisiPage },
      { path: 'didattica', component: AdminDidatticaPage },
      { path: 'moderazione', component: AdminModerazionePage },
      { path: 'tickets', component: AdminHelpDeskPage },
      { path: 'campus', component: AdminCampusPage },
      { path: 'analytics', component: AdminAnalyticsPage }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminDashboardPageRoutingModule {}
