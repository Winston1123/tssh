// 使用和风天气API获取天气信息
const WEATHER_KEY = 'd3fb694293d04b8d91fe5e674bcbde07';

async function getWeather() {
    try {
        // 首先获取用户位置
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // 调用和风天气API
        const response = await fetch(`https://devapi.qweather.com/v7/weather/now?key=${WEATHER_KEY}&location=${longitude},${latitude}`);
        const data = await response.json();
        
        if (data.code === '200') {
            updateWeatherUI(data.now);
            // 缓存天气数据
            localStorage.setItem('weatherData', JSON.stringify({
                data: data.now,
                timestamp: Date.now()
            }));
        } else {
            throw new Error('获取天气信息失败');
        }
    } catch (error) {
        console.error('天气信息获取失败:', error);
        // 尝试从缓存获取天气数据
        const cachedWeather = localStorage.getItem('weatherData');
        if (cachedWeather) {
            const { data, timestamp } = JSON.parse(cachedWeather);
            // 如果缓存数据不超过1小时，则使用缓存数据
            if (Date.now() - timestamp < 3600000) {
                updateWeatherUI(data);
                return;
            }
        }
        document.querySelector('.weather-widget').innerHTML = `
            <div class="weather-error">
                <p>暂时无法获取天气信息</p>
            </div>
        `;
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('浏览器不支持地理位置'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function updateWeatherUI(weatherData) {
    const weatherWidget = document.querySelector('.weather-widget');
    weatherWidget.innerHTML = `
        <div class="weather-info">
            <div class="weather-header">
                <div class="weather-temp">${weatherData.temp}°C</div>
                <div class="weather-icon">
                    <i class="fas ${getWeatherIcon(weatherData.icon)}"></i>
                </div>
            </div>
            <div class="weather-desc">
                <p>${weatherData.text}</p>
                <p>湿度: ${weatherData.humidity}%</p>
                <p>风速: ${weatherData.windSpeed}km/h</p>
            </div>
        </div>
    `;
}

function getWeatherIcon(code) {
    // 根据和风天气的天气代码映射到Font Awesome图标
    const iconMap = {
        '100': 'fa-sun',           // 晴
        '101': 'fa-cloud-sun',     // 多云
        '102': 'fa-cloud',         // 少云
        '103': 'fa-cloud',         // 晴间多云
        '104': 'fa-cloud',         // 阴
        '300': 'fa-cloud-rain',    // 阵雨
        '301': 'fa-cloud-showers-heavy', // 强阵雨
        '302': 'fa-bolt',          // 雷阵雨
        '313': 'fa-snowflake',     // 冻雨
        '400': 'fa-snowflake',     // 小雪
        '401': 'fa-snowflake',     // 中雪
        '402': 'fa-snowflake',     // 大雪
    };
    return iconMap[code] || 'fa-cloud';
}

// 页面加载完成后获取天气信息
document.addEventListener('DOMContentLoaded', getWeather);