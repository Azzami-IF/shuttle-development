import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { NavService, NavItem } from '../nav.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BottomNavComponent implements OnInit {
  private nav = inject(NavService);
  private router = inject(Router);
  private auth = inject(AuthService);

  items: NavItem[] = [];

  constructor() {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.items = this.nav.getItems(role || undefined);
  }

  isActive(route: string) {
    return this.router.isActive(route, false);
  }
}
