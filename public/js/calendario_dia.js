document.getElementById("checkbox").addEventListener("change", function () {
    document.getElementById("enviar_dia_apagado").submit();
});




document.addEventListener("DOMContentLoaded", () => {


    const cont_horario_nuevo = document.getElementById("cont_horario_nuevo");
    const formPopup = document.getElementById("form_enviar_horario");
    const closeFormBtn = document.querySelectorAll(".close_form");
    const activityTimeInput = document.getElementById("activity_time");
    const btn_editar = document.querySelectorAll(".edit")
    const conts_form = document.getElementById("conts_form")
    const form_enviar_horario = document.getElementById("form_enviar_horario")
    const form_editar_horario_dia = document.getElementById("form_editar_horario_dia")
    const btn_agregar_opc = document.querySelectorAll(".btn_agregar_opc");
    const btn_desac_opc = document.querySelectorAll(".btn_desac_opc")
    const form_enviar_horario_apagado = document.getElementById("form_enviar_horario_apagado")
    const cont_main_calendar_dia = document.getElementById("cont_main_calendar_dia");

    setTimeout(() => {
        cont_main_calendar_dia.classList.add ("active");
        
    }, 100); // 200 milisegundos = 0.2 segundos

    btn_agregar_opc.forEach(element => {
        element.addEventListener("click", (event) => {
            form_enviar_horario.classList.add('active');
            form_enviar_horario_apagado.classList.remove('active');
        })
    });
    btn_desac_opc.forEach(element => {
        element.addEventListener("click", (event) => {
            form_enviar_horario.classList.remove('active');
            form_enviar_horario_apagado.classList.add('active');
        })
    });

    // Mostrar formulario al hacer clic en una franja horaria
    cont_horario_nuevo.addEventListener("click", (event) => {

        form_enviar_horario.classList.add('active');
        conts_form.classList.add('active');

        window.addEventListener("load", adjustHeight);
        window.addEventListener("resize", adjustHeight);
        // Desplazar hacia el elemento
        form_enviar_horario.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    });
    btn_editar.forEach(horario => {
        horario.addEventListener("click", (event) => {
            const parent = event.target.parentElement;


            const data_nombre = parent.getAttribute('data-nombre');
            const data_horario = parent.getAttribute('data-horario');
            const data_duracion = parent.getAttribute('data-duracion');

            const horario_formateado = data_horario.slice(0, 5);
            // Asigna los valores a los inputs
            let input_name_horario = document.getElementById("input_name_horario");
            let activity_time = document.getElementById("activity_time");
            let input_duracion = document.getElementById("input_duracion");

            input_name_horario.value = data_nombre;
            activity_time.value = horario_formateado;
            input_duracion.value = data_duracion;


            conts_form.classList.add('active');
            form_editar_horario_dia.classList.add('active');


            window.addEventListener("load", adjustHeight);
            window.addEventListener("resize", adjustHeight);
            form_editar_horario_dia.scrollIntoView({
                behavior: "smooth", // Desplazamiento suave
                block: "center",    // Centrar el elemento en la vista
            });
        });
    })
    closeFormBtn.forEach(btn => {
        btn.addEventListener("click", () => {
            conts_form.classList.remove("active");
            form_enviar_horario.classList.remove('active');
            // form_editar_horario_dia.classList.remove('active');
        });
    })


    function convertTo24Hour(hour) {
        const [time, meridiem] = hour.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (meridiem === "PM" && hours !== 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        return `${String(hours).padStart(2, "0")}:00`;
    }
    adjustHeight()


});

function adjustHeight() {
    conts_form.style.height = `${Math.max(document.documentElement.scrollHeight, window.innerHeight)}px`;
}
