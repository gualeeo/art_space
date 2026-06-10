// src/pages/LoginPage.jsx
import React, { useState } from 'react'; //импорт реакта и хука для памяти
import { Link, useNavigate } from 'react-router-dom'; //хуки для навигации
import { login } from '../api'; //API-функция для аутентификации пользователя

//страница входа
function LoginPage() {
  //состояния
  const navigate = useNavigate(); //функция для перехода на другие страницы
  const [email, setEmail] = useState(''); //логин
  const [password, setPassword] = useState(''); //пароль
  const [isLoading, setIsLoading] = useState(false); //загрузка
  const [error, setError] = useState(''); //ошибка

  //отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault(); //без перезагрузки страницы
    setError('');
    setIsLoading(true); //загрузка

    try {
      const data = await login(email, password); //ожидание отправки логина и пароля на сервер
      console.log('Вход выполнен:', data);
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(error.message || 'Неверный email или пароль');
    } finally {
      setIsLoading(false); //завершение загрузки
    }
  };

  return (
    <div className="register-main">
      <h1 className="register-title">Вход</h1>
      <div className="auth-box">
        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{
              color: 'red',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#ffe6e6',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="login-email">Электронная почта</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            <Link to="/register" className="btn-secondary">Зарегистрироваться</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage; //экспорт страницы