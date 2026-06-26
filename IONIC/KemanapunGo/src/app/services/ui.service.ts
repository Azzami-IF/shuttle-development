import { Injectable, inject } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  constructor() {}

  private loadingElement: any;

  async showToast(message: string, color: string = 'dark', duration: number = 2000) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  async showFeaturePending() {
    await this.showToast('Fitur ini akan segera tersedia!', 'primary');
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showConfirm(header: string, message: string, confirmText: string = 'OK', cancelText: string = 'Batal') {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: cancelText, role: 'cancel' },
        { text: confirmText, role: 'confirm' }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  getErrorMessage(error: any, fallback: string) {
    if (!error) {
      return fallback;
    }

    const rawMessage = error?.error?.message;
    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      return rawMessage;
    }

    const errors = error?.error?.errors;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      const firstValue = firstKey ? errors[firstKey] : null;
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === 'string' && firstValue.trim()) {
        return firstValue;
      }
    }

    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message;
    }

    return fallback;
  }

  async showLoading(message: string = 'Mohon tunggu...') {
    this.loadingElement = await this.loadingCtrl.create({
      message,
      spinner: 'crescent'
    });
    await this.loadingElement.present();
    return this.loadingElement;
  }

  async hideLoading() {
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
  }

  async showRadioSelection(header: string, options: { label: string, value: string }[], currentValue: string) {
    const alert = await this.alertCtrl.create({
      header,
      inputs: options.map(opt => ({
        type: 'radio',
        label: opt.label,
        value: opt.value,
        checked: opt.value === currentValue
      })),
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Pilih', role: 'confirm' }
      ]
    });

    await alert.present();
    const { data, role } = await alert.onDidDismiss();
    return role === 'confirm' ? data.values : null;
  }
}
