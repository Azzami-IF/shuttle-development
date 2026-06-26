import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-driver-account',
  templateUrl: './driver-account.page.html',
  styleUrls: ['./driver-account.page.scss'],
})
export class DriverAccountPage {
  private auth = inject(AuthService);
  user$ = this.auth.user$;
}
