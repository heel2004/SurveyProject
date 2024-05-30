import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post('/api/register', { email, password });
            handleRedirecttoLogin();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setIsRegistered(false);
        }
    };

    const handleRedirecttoLogin = () => {
        navigate('/login');
    };

    return (
        <div className="register-container" style={{ margin: '20px', marginTop: '80px' }}>
            <h2 className="register-heading">Register</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group" style={{ margin: '20px' }}>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group" style={{ margin: '20px' }}>
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {!isRegistered && (
                    <p className="error-message" style={{ color: 'red', margin: '20px' }}>User is already registered!</p>
                )}
                <button
                    type="submit"
                    className="btn btn-primary btn-md btn-block"
                    style={{ margin: '20px', marginTop: '2px' }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={20} color="inherit" style={{ marginTop: '6px' }} /> : 'Register'}
                </button>
            </form>
            <p className="login-text" style={{ margin: '20px', marginTop: '2px' }}>Already have an account? <button className="btn btn-link" onClick={handleRedirecttoLogin} style={{ marginTop: '-5px' }}>Login</button></p>
        </div>
    );
};

export default RegisterForm;
