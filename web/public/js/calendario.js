const year_text = document.getElementById('year_text');
const calendario_body = document.querySelector(".calendario-body");
let currentDate = new Date();

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

function renderCalendar() {
    const year = currentDate.getFullYear();
    year_text.textContent = year;

    for (let index = 0; index < 12; index++) {
        const div_mes = document.createElement("div");
        const text_mes = document.createElement("h3");
        text_mes.classList.add("text_mes");
        div_mes.classList.add("div_mes");

        // Contenedor para los días de la semana
        const header_dias = document.createElement("div");
        header_dias.classList.add("header_dias");

        // Agregar los días de la semana al encabezado
        diasSemana.forEach((dia) => {
            const diaSemana = document.createElement("span");
            diaSemana.textContent = dia;
            diaSemana.classList.add("dia_semana");
            header_dias.appendChild(diaSemana);
        });

        // Contenedor para los días del mes
        const dias = document.createElement("div");
        dias.classList.add("cont_dias");

        // Obtener el primer día del mes y la cantidad total de días
        const firstDay = new Date(year, index, 1).getDay();
        const lastDate = new Date(year, index + 1, 0).getDate();

        // Agregar espacios vacíos para alinear los días con el primer día de la semana
        for (let empty = 0; empty < firstDay; empty++) {
            const emptyDay = document.createElement("span");
            emptyDay.classList.add("dia_vacio");
            dias.appendChild(emptyDay);
        }

        // Agregar los días del mes con enlaces
        for (let date = 1; date <= lastDate; date++) {
            const link_dia = document.createElement('a');
            link_dia.textContent = date;
            link_dia.classList.add("dia_mes");
            link_dia.href = `/calendar_dia?dia=${date}&mes=${index}`;

            // Marcar el día actual
            if (
                date === new Date().getDate() &&
                index === new Date().getMonth() &&
                year === new Date().getFullYear()
            ) {
                link_dia.classList.add('hoy');
            }

            dias.appendChild(link_dia);
        }

        // Agregar el mes y sus días al contenedor principal
        text_mes.textContent = meses[index];
        if (index === new Date().getMonth() && year === new Date().getFullYear()) {
            text_mes.classList.add('mes_hoy');
        }

        div_mes.appendChild(text_mes);
        div_mes.appendChild(header_dias); // Encabezado con días de la semana
        div_mes.appendChild(dias); // Días del mes
        calendario_body.appendChild(div_mes);
    }
}

renderCalendar();
