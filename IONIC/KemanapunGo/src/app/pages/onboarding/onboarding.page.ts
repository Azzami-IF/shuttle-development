import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {

  public footerExpanded: boolean = false;
  public isDraggingFooter: boolean = false;

  private startY: number = 0;
  private currentTranslate: number = 0;
  private maxTranslate: number = 120; // drag distance when collapsing

  public get footerTransform(): string {
    return `translateY(${this.currentTranslate}px)`;
  }

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getHomeRoute()], { replaceUrl: true });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  toggleFooter() {
    this.footerExpanded = !this.footerExpanded;
    this.currentTranslate = this.footerExpanded ? 0 : this.maxTranslate;
  }

  onFooterTouchStart(ev: TouchEvent) {
    if (!ev.touches || ev.touches.length === 0) { return; }
    this.isDraggingFooter = true;
    this.startY = ev.touches[0].clientY;
    // currentTranslate already holds the current state
  }

  onFooterTouchMove(ev: TouchEvent) {
    if (!this.isDraggingFooter || !ev.touches || ev.touches.length === 0) { return; }
    const delta = ev.touches[0].clientY - this.startY;
    let next = this.currentTranslate + delta;
    next = Math.max(0, Math.min(this.maxTranslate, next));
    this.currentTranslate = next;
  }

  onFooterTouchEnd() {
    if (!this.isDraggingFooter) { return; }
    // read numeric value from transform
    const finalTranslate = this.currentTranslate;
    // decide threshold: expand if more than halfway up
    const shouldExpand = finalTranslate < (this.maxTranslate / 2);
    this.footerExpanded = shouldExpand;
    this.currentTranslate = shouldExpand ? 0 : this.maxTranslate;
    this.isDraggingFooter = false;
  }
}
