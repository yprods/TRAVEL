import React, { useState } from 'react'
import { X, Mail, Lock, User, Phone } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import { api } from '../api/client'
import { validateEmail, validatePhone, validatePassword, AppError, showErrorToast } from '../utils/errorHandler'
import './SignupModal.css'

function SignupModal({ onClose, onSwitchToLogin }) {
  const language = useStore((state) => state.language || 'en')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [step, setStep] = useState(1) // 1: signup form, 2: OTP verification
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setErrorState = useStore((state) => state.setError)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new AppError('Name is required', 'VALIDATION_ERROR', 400)
      }

      if (!validateEmail(formData.email)) {
        throw new AppError('Invalid email address', 'VALIDATION_ERROR', 400)
      }

      if (formData.phone && !validatePhone(formData.phone)) {
        throw new AppError('Invalid phone number', 'VALIDATION_ERROR', 400)
      }

      if (!validatePassword(formData.password)) {
        throw new AppError(getTranslation('passwordTooShort', language) || 'Password must be at least 6 characters', 'VALIDATION_ERROR', 400)
      }

      if (formData.password !== formData.confirmPassword) {
        throw new AppError(getTranslation('passwordsDontMatch', language) || 'Passwords do not match', 'VALIDATION_ERROR', 400)
      }

      setLoading(true)
      
      await api.signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      })
      
      setStep(2) // Move to OTP verification
    } catch (error) {
      const errorMessage = error instanceof AppError 
        ? error.message 
        : getTranslation('signupFailed', language) || 'Signup failed'
      setError(errorMessage)
      showErrorToast(error, setErrorState)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const data = await api.verifyOTP(formData.email, otp)
      
      // Store user session
      localStorage.setItem('userToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      useStore.getState().setUser(data.user)
      onClose()
    } catch (error) {
      const errorMessage = error instanceof AppError 
        ? error.message 
        : getTranslation('invalidOTP', language) || 'Invalid OTP'
      setError(errorMessage)
      showErrorToast(error, setErrorState)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      await api.resendOTP(formData.email)
      alert(getTranslation('otpResent', language) || 'OTP has been resent to your email')
    } catch (error) {
      const errorMessage = error instanceof AppError 
        ? error.message 
        : getTranslation('resendFailed', language) || 'Failed to resend OTP'
      setError(errorMessage)
      showErrorToast(error, setErrorState)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-modal-overlay" onClick={onClose}>
      <div className="signup-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="signup-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="signup-header">
          <h2>{step === 1 ? getTranslation('signUp', language) || 'Sign Up' : getTranslation('verifyOTP', language) || 'Verify OTP'}</h2>
          <p>
            {step === 1 
              ? getTranslation('createAccount', language) || 'Create your account to start exploring'
              : getTranslation('enterOTP', language) || 'Enter the OTP sent to your email'
            }
          </p>
        </div>

        {error && (
          <div className="signup-error">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignup} className="signup-form">
            <div className="form-group">
              <User size={18} />
              <input
                type="text"
                placeholder={getTranslation('fullName', language) || 'Full Name'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Mail size={18} />
              <input
                type="email"
                placeholder={getTranslation('email', language) || 'Email'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Phone size={18} />
              <input
                type="tel"
                placeholder={getTranslation('phone', language) || 'Phone Number'}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Lock size={18} />
              <input
                type="password"
                placeholder={getTranslation('password', language) || 'Password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Lock size={18} />
              <input
                type="password"
                placeholder={getTranslation('confirmPassword', language) || 'Confirm Password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="signup-submit-btn" disabled={loading}>
              {loading ? getTranslation('loading', language) : getTranslation('signUp', language)}
            </button>

            <div className="signup-footer">
              <p>
                {getTranslation('alreadyHaveAccount', language) || 'Already have an account?'}{' '}
                <button type="button" className="switch-btn" onClick={onSwitchToLogin}>
                  {getTranslation('logIn', language) || 'Log In'}
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="signup-form">
            <div className="otp-info">
              <p>{getTranslation('otpSentTo', language) || 'OTP sent to:'} {formData.email}</p>
            </div>

            <div className="form-group otp-group">
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="otp-input"
                required
              />
            </div>

            <button type="submit" className="signup-submit-btn" disabled={loading || otp.length !== 6}>
              {loading ? getTranslation('verifying', language) || 'Verifying...' : getTranslation('verify', language) || 'Verify'}
            </button>

            <button type="button" className="resend-otp-btn" onClick={handleResendOTP} disabled={loading}>
              {getTranslation('resendOTP', language) || 'Resend OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default SignupModal

