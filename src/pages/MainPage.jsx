import React from 'react'; //импорт реакта
import { Link } from 'react-router-dom'; //импорт тега-ссылки для навигации без перезагрузки страницы

//главная страница
function MainPage() {
  return (
    <div className="main-page-container">
      <div className="text-content">
        <h1>Твой путь в мир искусства</h1>
        <p>
          Присоединяйтесь к сообществу художников со всего мира. 
          Делитесь работами, вдохновляйтесь и находите единомышленников.
        </p>
        <div className="buttons">
          <Link to="/register" className="btn-primary">Зарегистрироваться</Link>
          <Link to="/gallery" className="btn-secondary">Смотреть работы</Link>
        </div>
      </div>
      
      <div className="image-content">
        <img 
          src="/demonstration.jpg" 
          alt="Демонстрационная работа" 
        />
      </div>
    </div>
  );
}

export default MainPage; //экспорт страницы