const themeSlider = document.querySelector('.theme-slider');
const sliderBackground = themeSlider.querySelector('.slider-background');
const sliderIcon = themeSlider.querySelector('.slider-icon');

let theme = '';

function toggleTheme(event){
    if(theme == 'light'){
        theme = 'dark';
    }
    else if (theme == 'dark'){
        theme = 'light';
    }
    saveTheme();
    renderTheme();
}


function renderTheme(){
    loadTheme();
    if (theme == 'light'){
        sliderIcon.innerHTML = '<i class="fas fa-sun"></i>'
        document.querySelector('html').classList.remove('dark-theme');
        themeSlider.classList.remove('dark');
        mouseLight.classList.remove('active');
    }
    else if (theme == 'dark'){
        sliderIcon.innerHTML = '<i class="fas fa-moon"></i>'
        document.querySelector('html').classList.add('dark-theme');
        themeSlider.classList.add('dark');
        mouseLight.classList.add('active');
    }

}



function saveTheme(){
    localStorage.setItem('theme', theme);
}
function loadTheme(){
    const tempTheme = localStorage.getItem('theme');
    if (tempTheme){
        theme = localStorage.getItem('theme');
    }
    else{
        theme = 'light'
    }
}


document.addEventListener('DOMContentLoaded', renderTheme);
themeSlider.addEventListener('click', toggleTheme);