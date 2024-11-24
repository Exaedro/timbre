const editar = document.querySelectorAll(".editar");
const conts_form = document.getElementById("conts_form");
const form_editar = document.getElementById("editar_horario_fijo");
const agregar_horario_fijo = document.getElementById("agregar_horario_fijo");
const boton_agregar = document.getElementById("boton_agregar")


editar.forEach((button) => {
    button.addEventListener("click", () => {

        const contenedorHorario = button.closest(".cont_horario");


        const nombreHorario = contenedorHorario.querySelector(".nombre_horario").innerText;
        const hora = contenedorHorario.querySelector(".hora").innerText;
        const HorarioID = contenedorHorario.querySelector("#HorarioID").value;
        const duracion = contenedorHorario.querySelector(".duracion").innerText.replace("Duracion: ", "").replace("s", "").trim();

        const inputNameHorario = form_editar.querySelector("#input_name_horario");
        const input_id = form_editar.querySelector("#input_id");
        const inputHorario = form_editar.querySelector("#input_horario");
        const inputDuracion = form_editar.querySelector("#input_duracion");

        input_id.value = HorarioID;

        inputNameHorario.value = nombreHorario;
        inputHorario.value = hora;
        inputDuracion.value = duracion;

        conts_form.classList.add("active")
        form_editar.classList.add("active")

        window.addEventListener("load", adjustHeight());
        window.addEventListener("resize", adjustHeight());
    });
});

boton_agregar.addEventListener("click", () => {
    conts_form.classList.add("active")
    agregar_horario_fijo.classList.add("active")

    window.addEventListener("load", adjustHeight());
    window.addEventListener("resize", adjustHeight());
})

function adjustHeight() {

    conts_form.style.height = `${Math.max(document.documentElement.scrollHeight, window.innerHeight)}px`;
}

