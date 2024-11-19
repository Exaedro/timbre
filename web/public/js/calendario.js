const calendarioFechas = document.getElementById('calendarioFechas');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');

let currentDate = new Date();

function renderCalendar() {
    calendarioFechas.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  
    for (let i = 0; i < firstDay; i++) {
        calendarioFechas.innerHTML += `<div></div>`;
    }

    // Add dates of the month
    for (let date = 1; date <= lastDate; date++) {
        const div = document.createElement('div');
        div.textContent = date;
        if (date === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            div.classList.add('hoy');
        }
        calendarioFechas.appendChild(div);
    }
}

prevMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();
