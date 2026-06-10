import React, { useState, useEffect, useRef, useCallback } from 'react'; //импорт реакта
//хуки для хранения данных, загрузки работ при изменении страницы или фильтров, хранения ссылки, и чтобы функция не пересоздавалась
import { Link } from 'react-router-dom'; //импорт тега-ссылки для навигации без перезагрузки
import { getWorks } from '../api'; //API-функция для получения работ

//мок-данные
const allMockWorks = [
  ...Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Работа №${i + 1}`,
    author: { username: ["Анна Иванова", "Олег Петров", "Мария Сидорова", "Дмитрий Козлов"][i % 4] },
    category: ["Масло", "Акварель", "Акрил", "Смешанная техника"][i % 3],
    image_url: "/demonstration.jpg",
    created_at: `2026-05-${String(30 - (i % 28)).padStart(2, '0')}`,
    rating: (4 + Math.random()).toFixed(1),
    tags: [["#пейзаж", "#природа"], ["#город", "#ночь"], ["#портрет", "#люди"], ["#абстракция"]][i % 4]
  }))
];

const fetchMockWorks = async (page, perPage, filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = allMockWorks.filter(work => {
    const matchesSearch = !filters.search || 
      work.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      work.author.username.toLowerCase().includes(filters.search.toLowerCase());
    const matchesTechnique = !filters.technique || filters.technique === "Все" || 
      work.category === filters.technique;
    return matchesSearch && matchesTechnique;
  });
  
  if (filters.date === "Сначала новые") {
    filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (filters.date === "Сначала старые") {
    filtered = filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const items = filtered.slice(startIndex, endIndex);
  
  return {
    items,
    currentPage: page,
    totalPages: Math.ceil(filtered.length / perPage),
    hasMore: endIndex < filtered.length
  };
};

const PER_PAGE = 8; //количество работ на одной странице при загрузке

//страница галереи
function GalleryPage() {
  //состояния
  const [works, setWorks] = useState([]); //массив загруженных работ
  const [page, setPage] = useState(1); //страница
  const [hasMore, setHasMore] = useState(true); //проверка существования работ для загрузки
  const [loading, setLoading] = useState(false); //загрузка
  const [error, setError] = useState(''); //ошибка
  const [searchQuery, setSearchQuery] = useState(""); //поисковой запрос
  const [openFilter, setOpenFilter] = useState(null); //открытый фильтр
  //выбранные фильтры
  const [selectedFilters, setSelectedFilters] = useState({
    technique: "Все",
    date: "По умолчанию",
    rating: "Все",
    tags: "Все"
  });

  //бесконечная прокрутка
  const observer = useRef(); //хранилище для наблюдателя
  const lastWorkRef = useCallback(node => {
    if (loading) return; //если идёт загрузка
    if (observer.current) observer.current.disconnect(); //отключение старого наблюдателя
    
    //создание ноо/вого наблюдателя
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) { //если последний элемент виден на экране и есть еще работы
        setPage(prev => prev + 1); //увеличение номера страницы
      }
    });
    
    if (node) observer.current.observe(node); //наблюдение за переданным элементом
  }, [loading, hasMore]); //пересоздание, если изменились loading или hasMore

  //загрузка работ
  useEffect(() => {
    const loadWorks = async () => {
      setLoading(true); //загрузка работ
      setError('');
      
      try {
        let result;
        
        if (USE_MOCK) {
          //для мок данных
          result = await fetchMockWorks(page, PER_PAGE, {
            search: searchQuery,
            technique: selectedFilters.technique,
            date: selectedFilters.date
          });
        } else {
          //для бэкенда
          result = await getWorks({
            page: page,
            per_page: PER_PAGE,
            search: searchQuery,
            category: selectedFilters.technique !== "Все" ? selectedFilters.technique : undefined,
            sort: selectedFilters.date === "Сначала новые" ? "newest" : 
                   selectedFilters.date === "Сначала старые" ? "oldest" : undefined,
            min_rating: selectedFilters.rating !== "Все" ? parseFloat(selectedFilters.rating) : undefined,
            tag: selectedFilters.tags !== "Все" ? selectedFilters.tags : undefined
          });
        }
        
        setWorks(prev => page === 1 ? result.items : [...prev, ...result.items]); //обновление списка работ
        setHasMore(result.hasMore); //сохранение информации о существовании еще работ
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить работы. Попробуйте позже.');
      } finally {
        setLoading(false); //прекращение загрузки
      }
    };
    
    loadWorks(); //показ работ
  }, [page, searchQuery, selectedFilters]); //при изменении зависимостей - перезагрузка

  //сброс пагинации при изменении фильтров
  useEffect(() => {
    setPage(1);
    setWorks([]);
    setHasMore(true);
  }, [searchQuery, selectedFilters]);

  //выбранный фильтр (значение)
  const handleFilterSelect = (filterName, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterName]: value }));
    setOpenFilter(null); //закрытие выпадающего меню
  };

  //открытие/зактрые списка фильтра
  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  //опции в фильтрах
  const filterOptions = {
    technique: ["Все", "Масло", "Акварель", "Акрил", "Графика", "Смешанная техника"],
    date: ["По умолчанию", "Сначала новые", "Сначала старые"],
    rating: ["Все", "4.5+", "4.0+", "3.5+"],
    tags: ["Все", "пейзаж", "город", "портрет", "абстракция", "ночь", "природа", "море", "цветы", "люди"]
  };

  //названия фильтров
  const filterLabels = {technique: "Техника", date: "Дата публикации", rating: "Рейтинг", tags: "Теги"};

  //получение правильного поля для отображения
  const getWorkImage = (work) => work.image_url || work.image || "/demonstration.jpg";
  const getWorkAuthor = (work) => typeof work.author === 'object' ? work.author.username : work.author;
  const getWorkCategory = (work) => work.category || work.technique;

  return (
    <div className="gallery-main">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по названию или автору..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="gallery-container">
        {/* фильтры */}
        <div className="gallery-sidebar">
          <div className="filters">
            {Object.keys(filterLabels).map(filterKey => (
              <div key={filterKey} className="filter-wrapper">
                <button className="filter-btn" onClick={() => toggleFilter(filterKey)}>
                  {filterLabels[filterKey]}
                  <span className="filter-arrow">
                    {openFilter === filterKey ? "▲" : "▼"}
                  </span>
                </button>
                
                {openFilter === filterKey && (
                  <div className="filter-dropdown">
                    {filterOptions[filterKey].map(option => (
                      <div
                        key={option}
                        className={`filter-option ${selectedFilters[filterKey] === option ? 'selected' : ''}`}
                        onClick={() => handleFilterSelect(filterKey, option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* сетка работ */}
        <div className="works">
          {error && (
            <div className="error-message" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#e74c3c', padding: '40px' }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '20px' }}>
                Попробовать снова
              </button>
            </div>
          )}
          
          {/* нет ошибки, нет работ, не загружается */}
          {!error && works.length === 0 && !loading && (
            <p className="no-works-message">Работы не найдены</p>
          )}
          
          {/* список карточек */}
          {!error && works.map((work, index) => {
            const isLast = index === works.length - 1;
            return (
              <Link 
                to={`/work/${work.id}`} 
                key={`${work.id}-${page}`}
                className="work-link"
                ref={isLast ? lastWorkRef : null} //привязывание наблюдателя
              >
                <div className="work-card">
                  <div className="work-image">
                    <img 
                      src={getWorkImage(work)} 
                      alt={work.title}
                      onError={(e) => {
                        e.target.src = "/demonstration.jpg";
                      }}
                    />
                  </div>
                  <div className="work-title">
                    <h3>{work.title}</h3>
                    <p>{getWorkAuthor(work)}</p>
                    <p style={{ fontSize: "14px", color: "#666" }}>{getWorkCategory(work)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* загрузка */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка работ...</p>
        </div>
      )}

      {!hasMore && works.length > 0 && !loading && (
        <p className="all-loaded-message">Вы просмотрели все работы</p>
      )}
    </div>
  );
}

export default GalleryPage; //экспорт страницы