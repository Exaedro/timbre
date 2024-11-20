
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const year_text = document.getElementById('year_text');
const calendario_body = document.querySelector(".calendario-body")
let currentDate = new Date();

function rendercalendar_full() {

}


const meses = ["Ene","Feb", "Mar", "Abr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dic"]




function renderCalendar() {


    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    for (let index = 0; index < 12; index++) {
        const div_mes = document.createElement("div")
        const text_mes = document.createElement("h3")
        text_mes.classList.add("text_mes")
        div_mes.classList.add("div_mes")
        const dias = document.createElement("div")
        dias.classList.add("cont_dias")
        const firstDay = new Date(year, index, 1).getDay();
        const lastDate = new Date(year, index + 1, 0).getDate();


        for (let date = 1; date <= lastDate; date++) {

            const div_dia = document.createElement('div');
            div_dia.textContent = date;
            div_dia.classList.add("dia_mes")
            console.log(date)
            if (date === new Date().getDate() && index === new Date().getMonth() && year === new Date().getFullYear()) {
                div_dia.classList.add('hoy');
            }

          
            dias.appendChild(div_dia);
        }
        
        text_mes.textContent= meses[index]
        if (index === new Date().getMonth() && year === new Date().getFullYear()) {
            text_mes.classList.add('mes_hoy');
        }
        div_mes.appendChild(text_mes);
        div_mes.appendChild(dias);
        calendario_body.appendChild(div_mes)
    }
}



renderCalendar();
