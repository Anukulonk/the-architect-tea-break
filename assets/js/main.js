const CONFIG = {
    startDate: new Date("2025-12-25"),
    ratchaburi: { lat: 13.5283, lon: 99.8134 },
    pathumThani: { lat: 14.0208, lon: 100.5250 },
    
    weatherKey: '1f3fb22fe5ff14459cc0e90ccce05c7d', 
    supabaseUrl: 'https://gjxdvzhilwdqwucqlegr.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqeGR2emhpbHdkcXd1Y3FsZWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODI4MTksImV4cCI6MjA4MzQ1ODgxOX0.wa7SNJ_ScOiCr5JrpVIUsYwhkdZTP11EvowNH6rDs_c', 
    
    messages: [
        "I know you want everything to be perfect, but please don't forget to give yourself some rest too.",
        "How was your day? If you're feeling tired, take a deep breath and get some Thai Tea boost!",
        "I'm always right here to support you. Feel free to talk to me whenever you need someone to lean on.",
        "You're already the most talented and amazing person. Please don't overwork yourself; I'm worried about you, you know?",
        "Remember to find some time to relax and recharge. You truly deserve it!"
    ]
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
}

async function updateWeather() {
    const cities = [
        { ...CONFIG.ratchaburi, id: 'weather-ratchaburi' },
        { ...CONFIG.pathumThani, id: 'weather-pathum' }
    ];

    for (let city of cities) {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${CONFIG.weatherKey}&units=metric`);
            const data = await res.json();
            
            if(data.main) {
                document.querySelector(`#${city.id} .temp`).innerText = `${Math.round(data.main.temp)}°C`;
                document.querySelector(`#${city.id} .condition`).innerText = data.weather[0].main;
            }
        } catch (e) { 
            console.error(`Weather service error for ${city.id}:`, e); 
        }
    }
}

async function fetchLatestNote() {
    if (!CONFIG.supabaseKey || CONFIG.supabaseKey === "" || CONFIG.supabaseKey.includes("YOUR_")) return;

    try {
        const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/notes?select=*&order=created_at.desc&limit=1`, {
            headers: {
                'apikey': CONFIG.supabaseKey,
                'Authorization': `Bearer ${CONFIG.supabaseKey}`
            }
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
            const note = data[0];
            const contentEl = document.querySelector('.note-content');
            const dateEl = document.querySelector('.note-date');
            
            if (contentEl) contentEl.innerText = `"${note.content}"`;
            if (dateEl) {
                const date = new Date(note.created_at).toLocaleDateString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
                dateEl.innerText = `Posted on: ${date}`;
            }
        }
    } catch (e) {
        console.error("Supabase error:", e);
    }
}

function showSupport() {
    const container = document.getElementById('toast-container');
    const msg = CONFIG.messages[Math.floor(Math.random() * CONFIG.messages.length)];
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div style="font-size: 0.65rem; color: var(--thai-tea); font-weight: bold; margin-bottom: 4px;">FEEDBACK FOR YOU</div>
        <div style="font-size: 0.85rem;">${msg}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 500);
    }, 4500);
}

window.onload = () => {
    const today = new Date();
    const diffTime = Math.abs(today - CONFIG.startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('days-count').innerText = diffDays;
    
    const dist = calculateDistance(
        CONFIG.ratchaburi.lat, CONFIG.ratchaburi.lon, 
        CONFIG.pathumThani.lat, CONFIG.pathumThani.lon
    );
    document.getElementById('distance-val').innerText = dist;

    const teaBtn = document.getElementById('tea-btn');
    if (teaBtn) teaBtn.addEventListener('click', showSupport);

    updateWeather();
    fetchLatestNote();
};