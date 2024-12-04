// const year_text = document.getElementById('year_text');
// const calendario_body = document.querySelector(".calendario-body");
// let currentDate = new Date();

// const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
// const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

// function renderCalendar() {
//     const year = currentDate.getFullYear();
//     year_text.textContent = year;

//     for (let index = 0; index < 12; index++) {
//         const div_mes = document.createElement("div");
//         const text_mes = document.createElement("h3");
//         text_mes.classList.add("text_mes");
//         div_mes.classList.add("div_mes");
 
      
//         const header_dias = document.createElement("div");
//         header_dias.classList.add("header_dias");

      
//         diasSemana.forEach((dia) => {
//             const diaSemana = document.createElement("span");
//             diaSemana.textContent = dia;
//             diaSemana.classList.add("dia_semana");
//             header_dias.appendChild(diaSemana);
//         });

//         const dias = document.createElement("div");
//         dias.classList.add("cont_dias");

//         // Obtener el primer día del mes y la cantidad total de días
//         const firstDay = new Date(year, index, 1).getDay();
//         const lastDate = new Date(year, index + 1, 0).getDate();

//         // Agregar espacios vacíos 
//         for (let empty = 0; empty < firstDay; empty++) {
//             const emptyDay = document.createElement("span");
//             emptyDay.classList.add("dia_vacio");
//             dias.appendChild(emptyDay);
//         }

//         // Agregar los días del mes con enlaces
//         for (let date = 1; date <= lastDate; date++) {
//             const link_dia = document.createElement('a');
//             const currentDate = new Date(year, index, date);
//             const nombre_dia = currentDate.getDay(); 

//             link_dia.textContent = date;
//             link_dia.classList.add("dia_mes");
//             link_dia.href = `/calendar_dia?dia=${date}&mes=${index}&nombre_dia=${nombre_dia}&año=${year}`;

//             // Marcar el día actual
//             if (
//                 date === new Date().getDate() &&
//                 index === new Date().getMonth() &&
//                 year === new Date().getFullYear()
//             ) {
//                 link_dia.classList.add('hoy');
//             }

//             dias.appendChild(link_dia);
//         }


//         text_mes.textContent = meses[index];
//         if (index === new Date().getMonth() && year === new Date().getFullYear()) {
//             text_mes.classList.add('mes_hoy');
//         }

//         div_mes.appendChild(text_mes);
//         div_mes.appendChild(header_dias); 
//         div_mes.appendChild(dias); 
//         calendario_body.appendChild(div_mes);
//     }
// }

// renderCalendar();

const query = document.getElementById("cont_main_query")
const cont_query = document.getElementById("cont_items_query")
const icon = document.getElementById("icon")
query.addEventListener("click",()=>{
    cont_query.classList.toggle("desac")
  
})