const slider = document.getElementById('slider');
const dots = document.querySelectorAll('.dot');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

let currentIndex = 0;
// ... 기존 변수들 ...
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
let autoPlayInterval;
let restartTimer;

// --- 테마 로직 시작 ---
const setDarkMode = (isDark) => {
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        localStorage.setItem('theme', 'light');
    }
};

// 초기 테마 설정
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setDarkMode(true);
} else {
    setDarkMode(false);
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setDarkMode(!isDark);
});
// --- 테마 로직 끝 ---

// 초기 자동 슬라이드 시작
startAutoPlay();

// 마우스/터치 이벤트 등록
slider.addEventListener('mousedown', dragStart);
slider.addEventListener('touchstart', dragStart);
slider.addEventListener('mouseup', dragEnd);
slider.addEventListener('touchend', dragEnd);
slider.addEventListener('mousemove', dragAction);
slider.addEventListener('touchmove', dragAction);
slider.addEventListener('mouseleave', dragEnd);

function dragStart(event) {
    stopAutoPlay();
    clearTimeout(restartTimer);
    
    isDragging = true;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
    slider.style.transition = 'none';
}

function dragAction(event) {
    if (isDragging) {
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }
}

function dragEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;

    // 임계값(100px) 이상 이동했을 때 슬라이드 변경
    if (movedBy < -100 && currentIndex < 2) currentIndex += 1;
    if (movedBy > 100 && currentIndex > 0) currentIndex -= 1;

    setPositionByIndex();
    
    // 조작 후 5초 뒤 자동 슬라이드 재개
    restartTimer = setTimeout(startAutoPlay, 5000);
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
}

function setSliderPosition() {
    slider.style.transform = `translateX(${currentTranslate}px)`;
}

function setPositionByIndex() {
    currentTranslate = currentIndex * -window.innerWidth;
    prevTranslate = currentTranslate;
    slider.style.transition = 'transform 0.5s ease-out';
    slider.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
}

function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % 3;
        setPositionByIndex();
    }, 3000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// 창 크기 조절 시 위치 재조정
window.addEventListener('resize', setPositionByIndex);
