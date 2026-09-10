import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './LoginPage.css'
import {login} from '../services/authService.js'
import hero from '../assets/login-hero.png'

function LoginPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (isLoading) return

        setError('')
        setIsLoading(true)

        try {
            const data = await login(email, password)
            sessionStorage.setItem('accessToken', data.accessToken)
            navigate('/dashboard', {replace: true})
        } catch {
            setError('Unable to log in. Please check your email and password and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (<main className="login-page">
            <section className="login-card" aria-labelledby="login-title">
                <div className="login-content">
                    <div className="login-logo" aria-hidden="true">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/>
                            <path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5"/>
                        </svg>
                    </div>

                    <header className="login-heading">
                        <h1 id="login-title">
                            Equipment &amp; Asset<br/>
                            Management System
                        </h1>
                        <p>Sign in to your account to continue</p>
                    </header>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>

                            <div className="login-input-wrap">
                                <svg
                                    className="login-field-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    aria-hidden="true"
                                >
                                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                                    <path d="m3 6 9 7 9-7"/>
                                </svg>

                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>

                            <div className="login-input-wrap login-password">
                                <svg
                                    className="login-field-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    aria-hidden="true"
                                >
                                    <rect x="5" y="10" width="14" height="11" rx="2"/>
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>
                                </svg>

                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />

                                <button
                                    className="login-password-toggle"
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-controls="password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                        {!showPassword && <path d="m3 3 18 18"/>}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {error && (<p className="login-error" role="alert">
                                {error}
                            </p>)}

                        <button
                            className="login-button"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <footer className="login-footer">
                        © 2026 EAMS. All rights reserved.
                    </footer>
                </div>

                <div className="login-illustration">
                    <img src={hero} alt=""/>
                </div>
            </section>
        </main>)
}

export default LoginPage