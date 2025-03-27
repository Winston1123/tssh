// 使用和风天气API获取天气信息
const WEATHER_KEY = 'YOUR_API_KEY';

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
        } else {
            throw new Error('获取天气信息失败');
        }
    } catch (error) {
        console.error('天气信息获取失败:', error);
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
        <div class="weather-header">
            <div class="weather-temp">${weatherData.temp}°C</div>
            <img src="https://a.hecdn.net/img/common/icon/202/${weatherData.icon}.png" alt="天气图标">
        </div>
        <div class="weather-desc">
            <p>${weatherData.text}</p>
            <p>湿度: ${weatherData.humidity}%</p>
            <p>风速: ${weatherData.windSpeed}km/h</p>
        </div>
    `;
}

// 页面加载完成后获取天气信息
document.addEventListener('DOMContentLoaded', getWeather);