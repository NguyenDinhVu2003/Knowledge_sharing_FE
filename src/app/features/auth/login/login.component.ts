import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the login form with validation
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Get username form control
   */
  get username() {
    return this.loginForm.get('username');
  }

  /**
   * Get password form control
   */
  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Get username error message
   */
  getUsernameErrorMessage(): string {
    if (this.username?.hasError('required')) {
      return 'Username is required';
    }
    if (this.username?.hasError('minlength')) {
      return 'Username must be at least 3 characters';
    }
    return '';
  }

  /**
   * Get password error message
   */
  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'Password is required';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Clear previous error message
    this.errorMessage.set(null);

    // Validate form
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Set loading state
    this.loading.set(true);
    
    // Disable form during submission
    this.loginForm.disable();

    const { username, password } = this.loginForm.value;

    // Call AuthService login
    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        // Show success message
        this.snackBar.open('Login successful! Welcome back.', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        // Redirect to home page
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loading.set(false);
        this.loginForm.enable();

        // Display error message
        const errorMsg = error?.error?.message || error?.message || 'Invalid credentials. Please try again.';
        this.errorMessage.set(errorMsg);

        // Focus on username field for retry
        setTimeout(() => {
          const usernameInput = document.querySelector('input[formControlName="username"]') as HTMLInputElement;
          usernameInput?.focus();
        }, 100);

        // Show error snackbar
        this.snackBar.open(errorMsg, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
