document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar_dia");
    const formPopup = document.getElementById("form_enviar_horario");
    const closeFormBtn = document.getElementById("close_form");
    const activityTimeInput = document.getElementById("activity_time");

    // Mostrar formulario al hacer clic en una franja horaria
    calendar.addEventListener("click", (event) => {
        const horario = event.target.closest(".horario");
        if (horario) {
            const selectedHour = horario.dataset.hora;
            if (selectedHour) {
                activityTimeInput.value = convertTo24Hour(selectedHour);
            }

            let y = event.clientY;
            y = y + 250
            //  posicion del formulario
            formPopup.style.top = `${y}px`;
         

            formPopup.classList.add("active");
        }
    });


    closeFormBtn.addEventListener("click", () => {
        formPopup.classList.remove("active");
    });


    function convertTo24Hour(hour) {
        const [time, meridiem] = hour.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (meridiem === "PM" && hours !== 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        return `${String(hours).padStart(2, "0")}:00`;
    }
});